"""Google gemini-embedding-001 wrapper with in-memory cache."""
import os
import hashlib
import logging
from typing import List

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Auto-correct deprecated model names (Google retired text-embedding-004 in Jan 2026)
_DEPRECATED_MODELS = {
    "text-embedding-004": "gemini-embedding-001",
    "embedding-001": "gemini-embedding-001",
    "text-embedding-005": "gemini-embedding-001",
}
_model_from_env = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
EMBEDDING_MODEL = _DEPRECATED_MODELS.get(_model_from_env, _model_from_env)
EMBEDDING_DIM = 768

_client = None
if GEMINI_API_KEY:
    try:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to init Gemini client: {e}")

_cache = {}
_CACHE_MAX = 2000


def _cache_key(prefix: str, text: str) -> str:
    return prefix + hashlib.sha256(text.encode("utf-8")).hexdigest()


def _store(key: str, vec: list):
    if len(_cache) >= _CACHE_MAX:
        _cache.pop(next(iter(_cache)))
    _cache[key] = vec


def _embed(text: str, prefix: str) -> List[float]:
    if not text or not text.strip():
        return [0.0] * EMBEDDING_DIM
    if _client is None:
        logger.error("Gemini client not initialized (missing API key?)")
        return [0.0] * EMBEDDING_DIM
    key = _cache_key(prefix, text)
    if key in _cache:
        return _cache[key]
    try:
        result = _client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIM),
        )
        vec = list(result.embeddings[0].values)
        _store(key, vec)
        return vec
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        return [0.0] * EMBEDDING_DIM


def embed_text(text: str) -> List[float]:
    """Embed a document (for indexing)."""
    return _embed(text, "doc:")


def embed_query(text: str) -> List[float]:
    """Embed a user query (for search)."""
    return _embed(text, "q:")


def embed_batch(texts: List[str]) -> List[List[float]]:
    """Embed multiple texts in a single API call. Returns one vector per input."""
    if not texts:
        return []
    if _client is None:
        logger.error("Gemini client not initialized (missing API key?)")
        return [[0.0] * EMBEDDING_DIM for _ in texts]

    # 1. Serve from cache where possible
    results: List[List[float]] = [None] * len(texts)  # type: ignore
    uncached_indices: List[int] = []
    uncached_texts: List[str] = []

    for i, text in enumerate(texts):
        if not text or not text.strip():
            results[i] = [0.0] * EMBEDDING_DIM
            continue
        key = _cache_key("doc:", text)
        if key in _cache:
            results[i] = _cache[key]
        else:
            uncached_indices.append(i)
            uncached_texts.append(text)

    # 2. One API call for everything uncached
    if uncached_texts:
        try:
            response = _client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=uncached_texts,
                config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIM),
            )
            for idx, embedding in zip(uncached_indices, response.embeddings):
                vec = list(embedding.values)
                results[idx] = vec
                _store(_cache_key("doc:", texts[idx]), vec)
        except Exception as e:
            logger.error(f"Batch embedding failed ({len(uncached_texts)} texts): {e}")
            for idx in uncached_indices:
                if results[idx] is None:
                    results[idx] = [0.0] * EMBEDDING_DIM

    # 3. Safety net — anything still None gets zero-vector
    for i in range(len(results)):
        if results[i] is None:
            results[i] = [0.0] * EMBEDDING_DIM

    return results