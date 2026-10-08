"""Unified LLM streaming: Groq primary, Gemini fallback."""
import os
import json
import logging
from typing import AsyncGenerator

import httpx

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL_FREE = os.getenv("AI_MODEL_FREE", "openai/gpt-oss-20b")
GROQ_MODEL_PREMIUM = os.getenv("AI_MODEL_PREMIUM", "openai/gpt-oss-120b")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Long read timeout for streaming; short connect timeout so dead endpoints fail fast
HTTP_TIMEOUT = httpx.Timeout(connect=10.0, read=120.0, write=10.0, pool=10.0)


async def stream_groq(messages, model, temperature=0.4, max_tokens=1500):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        async with client.stream("POST", GROQ_URL, headers=headers, json=payload) as r:
            if r.status_code != 200:
                body = await r.aread()
                raise RuntimeError(f"Groq {r.status_code}: {body[:200]!r}")
            async for line in r.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data = line[6:].strip()
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content")
                    if content:
                        yield content
                except json.JSONDecodeError:
                    continue


async def stream_gemini(messages, temperature=0.4, max_tokens=1500):
    system_parts = []
    chat_parts = []
    for m in messages:
        if m["role"] == "system":
            system_parts.append(m["content"])
        else:
            role = "user" if m["role"] == "user" else "model"
            chat_parts.append({"role": role, "parts": [{"text": m["content"]}]})

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
    )
    body = {
        "contents": chat_parts,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
        },
    }
    if system_parts:
        body["systemInstruction"] = {"parts": [{"text": "\n\n".join(system_parts)}]}

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        async with client.stream("POST", url, json=body) as r:
            if r.status_code != 200:
                err = await r.aread()
                raise RuntimeError(f"Gemini {r.status_code}: {err[:200]!r}")
            async for line in r.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data = line[6:].strip()
                try:
                    chunk = json.loads(data)
                    for cand in chunk.get("candidates", []):
                        for part in cand.get("content", {}).get("parts", []):
                            if "text" in part:
                                yield part["text"]
                except json.JSONDecodeError:
                    continue


async def stream_llm(messages, tier: str = "free") -> AsyncGenerator[dict, None]:
    """
    Yield events: {"type": "model", "name": "..."} and {"type": "token", "content": "..."}.
    Groq first; Gemini on any failure.
    """
    model = GROQ_MODEL_PREMIUM if tier == "premium" else GROQ_MODEL_FREE

    if GROQ_API_KEY:
        try:
            yield {"type": "model", "name": f"groq/{model}"}
            async for token in stream_groq(messages, model):
                yield {"type": "token", "content": token}
            return
        except Exception as e:
            logger.warning(f"Groq failed ({e}); falling back to Gemini")

    if GEMINI_API_KEY:
        try:
            yield {"type": "model", "name": f"gemini/{GEMINI_MODEL}"}
            async for token in stream_gemini(messages):
                yield {"type": "token", "content": token}
            return
        except Exception as e:
            logger.error(f"Gemini also failed: {e}")

    yield {
        "type": "token",
        "content": "\n\n⚠️ AI service is currently unavailable. Please try again in a moment.",
    }