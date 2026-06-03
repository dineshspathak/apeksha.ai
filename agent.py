"""Apeksha AI - Core Agent Loop."""

import json
import re
import ollama

from config import MODEL, SYSTEM_PROMPT, MAX_TOOL_ITERATIONS
from memory import ShortTermMemory, LongTermMemory
from knowledge import KnowledgeBase
from tools import execute_tool, TOOLS


class Apeksha:
    """Apeksha AI - A fully local, intelligent agent."""

    def __init__(self):
        self.short_memory = ShortTermMemory()
        self.long_memory = LongTermMemory()
        self.knowledge = KnowledgeBase()
        self.model = MODEL
        self.system_prompt = SYSTEM_PROMPT
        self.active_brain = "buddhi"  # Default branded model

        # Inject memory/knowledge functions into tools
        TOOLS["remember"] = self.long_memory.remember
        TOOLS["recall"] = self.long_memory.recall
        TOOLS["search_knowledge"] = self.knowledge.search

    def set_brain(self, brain_name: str):
        """Switch the AI brain (model)."""
        from models import MODELS, get_model_id
        if brain_name in MODELS:
            self.active_brain = brain_name
            # Auto-adjust system prompt for media brains
            if brain_name == "kalpana":
                self.system_prompt = """You are Kalpana (Imagination), an image generation assistant. When the user asks for an image, ALWAYS use the generate_image tool with a detailed, descriptive prompt.

When you need to use a tool, respond with:
<tool_call>
{"name": "generate_image", "arguments": {"prompt": "detailed description", "width": 1024, "height": 1024}}
</tool_call>

Rules:
- Always enhance the user's description with more detail for better results
- Default size is 1024x1024 unless user specifies otherwise
- For wide/landscape images use width=1280, height=720
- For tall/portrait images use width=720, height=1280
"""
            elif brain_name == "srijan":
                self.system_prompt = """You are Srijan (Creation), a video generation assistant. When the user asks for a video, ALWAYS use the generate_video tool with a descriptive prompt.

When you need to use a tool, respond with:
<tool_call>
{"name": "generate_video", "arguments": {"prompt": "detailed description of the video"}}
</tool_call>

Rules:
- Always enhance the user's description with motion and scene details
- Describe camera movement, lighting, and action for best results
"""
            else:
                from config import SYSTEM_PROMPT
                self.system_prompt = SYSTEM_PROMPT

    def chat(self, user_input: str) -> str:
        """Process user input through the agentic loop."""
        self.short_memory.add_user_message(user_input)

        iterations = 0
        response_text = ""

        while iterations < MAX_TOOL_ITERATIONS:
            iterations += 1
            response_text = self._call_llm()
            tool_call = self._extract_tool_call(response_text)

            if tool_call:
                tool_name = tool_call["name"]
                tool_args = tool_call["arguments"]
                result = execute_tool(tool_name, tool_args)

                self.short_memory.add_assistant_message(response_text)
                self.short_memory.add_tool_result(tool_name, result)
                continue
            else:
                self.short_memory.add_assistant_message(response_text)
                return response_text

        self.short_memory.add_assistant_message(response_text)
        return response_text

    def chat_stream(self, user_input: str):
        """Stream version - yields (type, content) tuples."""
        self.short_memory.add_user_message(user_input)

        iterations = 0
        response_text = ""

        while iterations < MAX_TOOL_ITERATIONS:
            iterations += 1
            response_text = self._call_llm()
            tool_call = self._extract_tool_call(response_text)

            if tool_call:
                tool_name = tool_call["name"]
                tool_args = tool_call["arguments"]

                args_preview = json.dumps(tool_args, indent=None)
                if len(args_preview) > 120:
                    args_preview = args_preview[:120] + "..."
                yield ("tool_start", f"🔧 {tool_name}({args_preview})")

                result = execute_tool(tool_name, tool_args)

                result_preview = result[:300] + "..." if len(result) > 300 else result
                yield ("tool_result", result_preview)

                self.short_memory.add_assistant_message(response_text)
                self.short_memory.add_tool_result(tool_name, result)
                continue
            else:
                self.short_memory.add_assistant_message(response_text)
                yield ("response", response_text)
                return

        self.short_memory.add_assistant_message(response_text)
        yield ("response", response_text)

    def _call_llm(self) -> str:
        """Call LLM — cloud (fast) or local (private)."""
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(self.short_memory.get_messages())

        # Try cloud first (fast)
        from cloud_llm import is_cloud_available, cloud_chat
        from models import get_model_id
        if is_cloud_available():
            try:
                model_id = get_model_id(self.active_brain, "cloud")
                return cloud_chat(messages, model=model_id)
            except Exception as e:
                pass  # Fall back to local

        # Local fallback
        try:
            local_model = get_model_id(self.active_brain, "local")
            response = ollama.chat(
                model=local_model,
                messages=messages,
                options={"num_ctx": 4096},
            )
            return response["message"]["content"]
        except Exception as e:
            return f"Error communicating with Ollama: {e}"

    def _extract_tool_call(self, text: str) -> dict | None:
        """Extract a tool call from the LLM response."""
        pattern = r"<tool_call>\s*(\{.*?\})\s*</tool_call>"
        match = re.search(pattern, text, re.DOTALL)

        if match:
            try:
                tool_data = json.loads(match.group(1))
                if "name" in tool_data and "arguments" in tool_data:
                    return tool_data
            except json.JSONDecodeError:
                pass
        return None

    def reset(self):
        """Reset short-term conversation memory."""
        self.short_memory.clear()

    def ingest_knowledge(self, directory: str = None) -> str:
        """Ingest documents into the knowledge base."""
        return self.knowledge.ingest_directory(directory)

    def get_status(self) -> dict:
        """Get agent status info."""
        return {
            "name": "Apeksha",
            "model": self.model,
            "session_messages": len(self.short_memory.messages),
            "long_term_memories": self.long_memory.get_count(),
            "knowledge_chunks": self.knowledge.get_count(),
        }
