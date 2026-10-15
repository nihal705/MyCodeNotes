"""Prompt loader with simple in-memory cache."""
import os

_PROMPT_DIR = os.path.dirname(__file__)
_cache: dict = {}


def load_prompt(name: str) -> str:
    if name in _cache:
        return _cache[name]
    path = os.path.join(_PROMPT_DIR, f"{name}.md")
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        _cache[name] = content
        return content
    except FileNotFoundError:
        return f"(missing prompt: {name})"