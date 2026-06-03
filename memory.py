"""Apeksha AI - Memory Management (Short-term + Long-term)."""

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from datetime import datetime

from config import MAX_HISTORY, CHROMA_PERSIST_DIR, EMBEDDING_MODEL


class ShortTermMemory:
    """Manages conversation history (current session)."""

    def __init__(self):
        self.messages: list[dict] = []

    def add_user_message(self, content: str):
        self.messages.append({"role": "user", "content": content})
        self._trim()

    def add_assistant_message(self, content: str):
        self.messages.append({"role": "assistant", "content": content})
        self._trim()

    def add_tool_result(self, tool_name: str, result: str):
        self.messages.append({
            "role": "user",
            "content": f"[Tool Result from '{tool_name}']:\n{result}"
        })
        self._trim()

    def get_messages(self) -> list[dict]:
        return self.messages.copy()

    def clear(self):
        self.messages = []

    def _trim(self):
        if len(self.messages) > MAX_HISTORY:
            self.messages = self.messages[-MAX_HISTORY:]

    def get_summary(self) -> str:
        return f"{len(self.messages)} messages in current session"


class LongTermMemory:
    """Persistent memory using ChromaDB - remembers across sessions."""

    def __init__(self):
        self._client = None
        self._collection = None
        self._embedder = None
        self._initialized = False

    def _init(self):
        """Lazy initialization to avoid slow startup."""
        if self._initialized:
            return

        try:
            self._embedder = SentenceTransformer(EMBEDDING_MODEL)
            self._client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
            self._collection = self._client.get_or_create_collection(
                name="apeksha_memories",
                metadata={"description": "Long-term memory for Apeksha AI"}
            )
            self._initialized = True
        except Exception as e:
            print(f"Warning: Long-term memory unavailable: {e}")
            self._initialized = False

    def remember(self, text: str) -> str:
        """Save something to long-term memory."""
        self._init()
        if not self._initialized:
            return "Error: Long-term memory not available."

        try:
            timestamp = datetime.now().isoformat()
            doc_id = f"mem_{timestamp}"

            embedding = self._embedder.encode(text).tolist()

            self._collection.add(
                ids=[doc_id],
                embeddings=[embedding],
                documents=[text],
                metadatas=[{"timestamp": timestamp, "type": "memory"}]
            )
            return f"✅ Remembered: '{text[:80]}...'" if len(text) > 80 else f"✅ Remembered: '{text}'"
        except Exception as e:
            return f"Error saving memory: {e}"

    def recall(self, query: str, n_results: int = 5) -> str:
        """Search long-term memory for relevant information."""
        self._init()
        if not self._initialized:
            return "Long-term memory not available."

        try:
            embedding = self._embedder.encode(query).tolist()

            results = self._collection.query(
                query_embeddings=[embedding],
                n_results=n_results,
            )

            if not results["documents"][0]:
                return "No relevant memories found."

            output = []
            for i, (doc, metadata) in enumerate(zip(results["documents"][0], results["metadatas"][0])):
                timestamp = metadata.get("timestamp", "unknown")
                output.append(f"{i+1}. [{timestamp}] {doc}")

            return "\n".join(output)
        except Exception as e:
            return f"Error recalling memory: {e}"

    def get_count(self) -> int:
        """Get total number of memories stored."""
        self._init()
        if not self._initialized:
            return 0
        try:
            return self._collection.count()
        except:
            return 0
