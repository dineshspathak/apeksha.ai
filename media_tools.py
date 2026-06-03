"""Apeksha AI — Image & Video Generation Tools (Free, no API key needed).

Uses Pollinations.ai — free, open-source, no signup required.
"""

import os
import time
import urllib.request
import urllib.parse
from pathlib import Path


WORKSPACE_DIR = os.environ.get("APEKSHA_WORKSPACE", "./workspace")


def generate_image(prompt: str, width: int = 1024, height: int = 1024) -> str:
    """
    Generate an image from a text description.
    Uses Pollinations.ai (free, no API key).
    
    Returns the file path of the saved image.
    """
    try:
        import ssl
        import urllib.request

        # Fix SSL on macOS
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        encoded_prompt = urllib.parse.quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true"

        # Save to workspace
        output_dir = Path(WORKSPACE_DIR) / "generated_images"
        output_dir.mkdir(parents=True, exist_ok=True)

        timestamp = int(time.time())
        filename = f"image_{timestamp}.png"
        filepath = output_dir / filename

        # Download with SSL fix
        req = urllib.request.Request(url)
        response = urllib.request.urlopen(req, context=ctx, timeout=60)
        with open(filepath, 'wb') as f:
            f.write(response.read())

        return f"✅ Image generated: {filepath}\nPrompt: {prompt}\nSize: {width}x{height}"
    except Exception as e:
        return f"Error generating image: {e}"


def generate_video(prompt: str) -> str:
    """
    Generate a short video from a text description.
    Uses Pollinations.ai video endpoint (free).
    
    Returns the file path of the saved video.
    """
    try:
        import ssl
        import urllib.request

        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        encoded_prompt = urllib.parse.quote(prompt)
        url = f"https://video.pollinations.ai/{encoded_prompt}"

        # Save to workspace
        output_dir = Path(WORKSPACE_DIR) / "generated_videos"
        output_dir.mkdir(parents=True, exist_ok=True)

        timestamp = int(time.time())
        filename = f"video_{timestamp}.mp4"
        filepath = output_dir / filename

        req = urllib.request.Request(url)
        response = urllib.request.urlopen(req, context=ctx, timeout=120)
        with open(filepath, 'wb') as f:
            f.write(response.read())

        return f"✅ Video generated: {filepath}\nPrompt: {prompt}"
    except Exception as e:
        return f"Error generating video: {e}"


def edit_image(image_path: str, instruction: str) -> str:
    """
    Edit an existing image with a text instruction.
    
    Args:
        image_path: Path to the existing image
        instruction: What to change (e.g., "make it sunset", "add a dog")
    """
    try:
        # For now, generate a new image with the instruction
        # Future: use img2img API when available
        prompt = f"{instruction}, based on original image"
        return generate_image(prompt)
    except Exception as e:
        return f"Error editing image: {e}"
