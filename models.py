"""Apeksha AI — Model Registry.

Users see branded Indian names. Backend uses real model IDs.
"""

# ═══════════════════════════════════════════════════════════════
# BRANDED MODELS
# User sees: "Drishti" → Backend uses: "llama-3.3-70b-versatile"
# ═══════════════════════════════════════════════════════════════

MODELS = {
    "buddhi": {
        "display_name": "Buddhi",
        "meaning": "Supreme Intellect",
        "description": "Best for complex coding & reasoning",
        "groq_model": "llama-3.3-70b-versatile",
        "local_model": "llama3.1",
        "category": "coding",
        "tier": "pro",
    },
    "drishti": {
        "display_name": "Drishti",
        "meaning": "Clear Vision",
        "description": "Fast answers & quick tasks",
        "groq_model": "llama-3.1-8b-instant",
        "local_model": "phi3:mini",
        "category": "general",
        "tier": "free",
    },
    "medha": {
        "display_name": "Medha",
        "meaning": "Deep Wisdom",
        "description": "Best for writing, reports & analysis",
        "groq_model": "qwen/qwen3-32b",
        "local_model": "llama3.1",
        "category": "writing",
        "tier": "pro",
    },
    "pragya": {
        "display_name": "Pragya",
        "meaning": "Practical Intelligence",
        "description": "Balanced — good at everything",
        "groq_model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "local_model": "llama3.1",
        "category": "general",
        "tier": "free",
    },
    "kalpana": {
        "display_name": "Kalpana",
        "meaning": "Imagination",
        "description": "Generate images from text descriptions",
        "groq_model": "llama-3.3-70b-versatile",
        "local_model": "llama3.1",
        "category": "image",
        "tier": "free",
    },
    "srijan": {
        "display_name": "Srijan",
        "meaning": "Creation",
        "description": "Generate videos from text descriptions",
        "groq_model": "llama-3.3-70b-versatile",
        "local_model": "llama3.1",
        "category": "video",
        "tier": "pro",
    },
}

# Default model
DEFAULT_MODEL = "buddhi"


def get_model_id(name: str, mode: str = "cloud") -> str:
    """Get the real model ID from branded name."""
    model = MODELS.get(name, MODELS[DEFAULT_MODEL])
    if mode == "cloud":
        return model["groq_model"]
    return model["local_model"]


def get_model_info(name: str) -> dict:
    """Get display info for a model."""
    return MODELS.get(name, MODELS[DEFAULT_MODEL])


def list_models(tier: str = None) -> list[dict]:
    """List all available models (optionally filtered by tier)."""
    result = []
    for key, model in MODELS.items():
        if tier and model["tier"] != tier:
            continue
        result.append({
            "id": key,
            "name": model["display_name"],
            "meaning": model["meaning"],
            "description": model["description"],
            "category": model["category"],
            "tier": model["tier"],
        })
    return result
