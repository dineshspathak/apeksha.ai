"""Apeksha AI - File Manager (Real file system access for the editor)."""

import os
from pathlib import Path
from typing import Optional


class FileManager:
    """Manages real file system access for the code editor."""

    def __init__(self, workspace_root: str = "."):
        self.workspace_root = Path(workspace_root).resolve()
        self._ensure_workspace()

    def _ensure_workspace(self):
        """Ensure workspace directory exists."""
        self.workspace_root.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, relative_path: str) -> Path:
        """Resolve a relative path to an absolute path within workspace."""
        resolved = (self.workspace_root / relative_path).resolve()
        # Security: prevent path traversal
        if not str(resolved).startswith(str(self.workspace_root)):
            raise PermissionError(f"Access denied: {relative_path} is outside workspace")
        return resolved

    def get_file_tree(self, directory: str = "", max_depth: int = 4) -> list[dict]:
        """Get the file tree structure."""
        root = self._resolve_path(directory)
        if not root.exists():
            return []
        return self._scan_directory(root, depth=0, max_depth=max_depth)

    def _scan_directory(self, path: Path, depth: int, max_depth: int) -> list[dict]:
        """Recursively scan directory."""
        if depth > max_depth:
            return []

        skip_dirs = {
            ".git", "node_modules", "__pycache__", ".venv", "venv",
            ".next", "dist", "build", ".DS_Store", "apeksha_memory",
        }

        entries = []
        try:
            items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
            for item in items:
                if item.name.startswith(".") and item.name in skip_dirs:
                    continue
                if item.name in skip_dirs:
                    continue

                relative = str(item.relative_to(self.workspace_root))

                if item.is_dir():
                    children = self._scan_directory(item, depth + 1, max_depth)
                    entries.append({
                        "name": item.name,
                        "path": relative,
                        "type": "folder",
                        "children": children,
                    })
                else:
                    entries.append({
                        "name": item.name,
                        "path": relative,
                        "type": "file",
                    })
        except PermissionError:
            pass

        return entries

    def read_file(self, relative_path: str) -> dict:
        """Read a file's content."""
        try:
            file_path = self._resolve_path(relative_path)
            if not file_path.exists():
                return {"error": f"File not found: {relative_path}"}
            if not file_path.is_file():
                return {"error": f"Not a file: {relative_path}"}
            if file_path.stat().st_size > 2_000_000:  # 2MB limit
                return {"error": "File too large (>2MB)"}

            content = file_path.read_text(encoding="utf-8")
            return {
                "path": relative_path,
                "content": content,
                "size": len(content),
                "language": self._get_language(file_path.name),
            }
        except UnicodeDecodeError:
            return {"error": f"Cannot read binary file: {relative_path}"}
        except Exception as e:
            return {"error": str(e)}

    def write_file(self, relative_path: str, content: str) -> dict:
        """Write content to a file."""
        try:
            file_path = self._resolve_path(relative_path)
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(content, encoding="utf-8")
            return {"success": True, "path": relative_path, "size": len(content)}
        except Exception as e:
            return {"error": str(e)}

    def create_file(self, relative_path: str, content: str = "") -> dict:
        """Create a new file."""
        file_path = self._resolve_path(relative_path)
        if file_path.exists():
            return {"error": f"File already exists: {relative_path}"}
        return self.write_file(relative_path, content)

    def delete_file(self, relative_path: str) -> dict:
        """Delete a file."""
        try:
            file_path = self._resolve_path(relative_path)
            if not file_path.exists():
                return {"error": f"File not found: {relative_path}"}
            if file_path.is_dir():
                import shutil
                shutil.rmtree(file_path)
            else:
                file_path.unlink()
            return {"success": True, "path": relative_path}
        except Exception as e:
            return {"error": str(e)}

    def rename_file(self, old_path: str, new_path: str) -> dict:
        """Rename/move a file."""
        try:
            source = self._resolve_path(old_path)
            dest = self._resolve_path(new_path)
            if not source.exists():
                return {"error": f"Source not found: {old_path}"}
            dest.parent.mkdir(parents=True, exist_ok=True)
            source.rename(dest)
            return {"success": True, "old_path": old_path, "new_path": new_path}
        except Exception as e:
            return {"error": str(e)}

    def create_folder(self, relative_path: str) -> dict:
        """Create a new folder."""
        try:
            folder_path = self._resolve_path(relative_path)
            folder_path.mkdir(parents=True, exist_ok=True)
            return {"success": True, "path": relative_path}
        except Exception as e:
            return {"error": str(e)}

    def search_files(self, query: str, extensions: Optional[list[str]] = None) -> list[dict]:
        """Search for files by name."""
        results = []
        query_lower = query.lower()

        for file_path in self.workspace_root.rglob("*"):
            if file_path.is_file():
                if query_lower in file_path.name.lower():
                    if extensions and file_path.suffix.lower() not in extensions:
                        continue
                    relative = str(file_path.relative_to(self.workspace_root))
                    results.append({
                        "name": file_path.name,
                        "path": relative,
                        "type": "file",
                    })
                    if len(results) >= 20:
                        break
        return results

    def _get_language(self, filename: str) -> str:
        """Detect language from filename."""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        lang_map = {
            "js": "javascript", "jsx": "javascript",
            "ts": "typescript", "tsx": "typescript",
            "py": "python", "html": "html", "css": "css",
            "json": "json", "md": "markdown", "yml": "yaml",
            "yaml": "yaml", "rs": "rust", "go": "go",
            "java": "java", "cpp": "cpp", "c": "c",
        }
        return lang_map.get(ext, "plaintext")
