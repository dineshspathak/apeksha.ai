"""Apeksha AI - Knowledge Base (RAG - Learn from your documents)."""

import os
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

from config import KNOWLEDGE_DIR, CHROMA_PERSIST_DIR, EMBEDDING_MODEL, SUPPORTED_EXTENSIONS, CHUNK_SIZE, CHUNK_OVERLAP


class KnowledgeBase:
    """RAG system - feed Apeksha your documents and she learns from them."""

    def __init__(self):
        self._client = None
        self._collection = None
        self._embedder = None
        self._initialized = False

    def _init(self):
        """Lazy initialization."""
        if self._initialized:
            return

        try:
            self._embedder = SentenceTransformer(EMBEDDING_MODEL)
            self._client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
            self._collection = self._client.get_or_create_collection(
                name="apeksha_knowledge",
                metadata={"description": "Knowledge base documents for Apeksha AI"}
            )
            self._initialized = True
        except Exception as e:
            print(f"Warning: Knowledge base unavailable: {e}")

    def ingest_directory(self, directory: str = None) -> str:
        """Ingest all supported files from the knowledge directory."""
        self._init()
        if not self._initialized:
            return "Error: Knowledge base not available."

        dir_path = Path(directory or KNOWLEDGE_DIR)
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            return f"Created knowledge directory: {dir_path}. Add files there and run ingest again."

        files_processed = 0
        chunks_added = 0

        for file_path in dir_path.rglob("*"):
            if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                continue
            if file_path.is_dir():
                continue

            try:
                content = self._read_file(file_path)
                if content:
                    chunks = self._chunk_text(content, str(file_path))
                    self._store_chunks(chunks, str(file_path))
                    files_processed += 1
                    chunks_added += len(chunks)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

        return f"✅ Ingested {files_processed} files ({chunks_added} chunks) into knowledge base."

    def search(self, query: str, n_results: int = 5) -> str:
        """Search the knowledge base for relevant information."""
        self._init()
        if not self._initialized:
            return "Knowledge base not available."

        try:
            embedding = self._embedder.encode(query).tolist()

            results = self._collection.query(
                query_embeddings=[embedding],
                n_results=n_results,
            )

            if not results["documents"][0]:
                return "No relevant information found in knowledge base."

            output = []
            for i, (doc, metadata) in enumerate(zip(results["documents"][0], results["metadatas"][0])):
                source = metadata.get("source", "unknown")
                output.append(f"[Source: {source}]\n{doc}\n")

            return "\n---\n".join(output)
        except Exception as e:
            return f"Search error: {e}"

    def _read_file(self, file_path: Path) -> str:
        """Read a file based on its extension."""
        ext = file_path.suffix.lower()

        if ext == ".pdf":
            return self._read_pdf(file_path)
        elif ext == ".docx":
            return self._read_docx(file_path)
        else:
            # Plain text files
            try:
                return file_path.read_text(encoding="utf-8")
            except:
                return file_path.read_text(encoding="latin-1")

    def _read_pdf(self, file_path: Path) -> str:
        """Extract text from PDF."""
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(str(file_path))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"PDF read error: {e}")
            return ""

    def _read_docx(self, file_path: Path) -> str:
        """Extract text from DOCX."""
        try:
            from docx import Document
            doc = Document(str(file_path))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text
        except Exception as e:
            print(f"DOCX read error: {e}")
            return ""

    def _chunk_text(self, text: str, source: str) -> list[dict]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0

        while start < len(text):
            end = start + CHUNK_SIZE
            chunk = text[start:end]

            if chunk.strip():
                chunks.append({
                    "text": chunk,
                    "source": source,
                    "chunk_index": len(chunks),
                })

            start += CHUNK_SIZE - CHUNK_OVERLAP

        return chunks

    def _store_chunks(self, chunks: list[dict], source: str):
        """Store chunks in ChromaDB."""
        if not chunks:
            return

        ids = [f"{source}_{c['chunk_index']}" for c in chunks]
        documents = [c["text"] for c in chunks]
        metadatas = [{"source": source, "chunk_index": c["chunk_index"]} for c in chunks]
        embeddings = [self._embedder.encode(doc).tolist() for doc in documents]

        # Upsert to avoid duplicates
        self._collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

    def get_count(self) -> int:
        """Get total chunks in knowledge base."""
        self._init()
        if not self._initialized:
            return 0
        try:
            return self._collection.count()
        except:
            return 0
