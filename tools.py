"""Apeksha AI - Tool implementations."""

import os
import subprocess
import sys
import json
from pathlib import Path


# ═══════════════════════════════════════════════════════════════
# WORKSPACE RESOLUTION
# All file/directory operations resolve relative to the workspace.
# ═══════════════════════════════════════════════════════════════

def _get_workspace() -> Path:
    """Return the active workspace directory (always writable)."""
    ws = os.environ.get("APEKSHA_WORKSPACE", "")
    if ws:
        return Path(ws).expanduser().resolve()
    # Default: ~/ApekshaWorkspace (writable on all platforms)
    return Path.home() / "ApekshaWorkspace"


def _resolve_path(path: str) -> Path:
    """
    Resolve a path for file operations.
    - Absolute paths are used as-is.
    - Relative paths are resolved relative to the workspace.
    """
    p = Path(path).expanduser()
    if p.is_absolute():
        return p
    workspace = _get_workspace()
    workspace.mkdir(parents=True, exist_ok=True)
    return (workspace / path).resolve()


# ═══════════════════════════════════════════════════════════════
# TOOLS
# ═══════════════════════════════════════════════════════════════

def web_search(query: str) -> str:
    """Search the web using DuckDuckGo."""
    try:
        from duckduckgo_search import DDGS

        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))

        if not results:
            return "No results found."

        output = []
        for r in results:
            output.append(f"**{r['title']}**\n{r['body']}\nURL: {r['href']}\n")
        return "\n".join(output)
    except Exception as e:
        return f"Search error: {e}"


def calculate(expression: str) -> str:
    """Evaluate a math expression safely using sympy."""
    try:
        from sympy import sympify, N
        result = N(sympify(expression))
        return str(result)
    except Exception as e:
        return f"Calculation error: {e}"


def run_python(code: str) -> str:
    """Execute Python code in a subprocess and return output."""
    try:
        result = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=60,
        )
        output = result.stdout
        if result.stderr:
            output += f"\nSTDERR: {result.stderr}"
        return output if output.strip() else "(No output)"
    except subprocess.TimeoutExpired:
        return "Error: Code execution timed out (60s limit)"
    except Exception as e:
        return f"Execution error: {e}"


def run_shell(command: str, working_dir: str = "") -> str:
    """Execute a shell command and return its output."""
    try:
        # Default cwd to workspace if not specified
        if not working_dir:
            cwd = str(_get_workspace())
        else:
            cwd = working_dir

        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120,
            cwd=cwd,
        )
        output = ""
        if result.stdout:
            output += result.stdout
        if result.stderr:
            output += f"\nSTDERR: {result.stderr}"
        if result.returncode != 0:
            output += f"\n(Exit code: {result.returncode})"
        return output if output.strip() else "(Command completed successfully)"
    except subprocess.TimeoutExpired:
        return "Error: Command timed out (120s limit)"
    except Exception as e:
        return f"Shell error: {e}"


def read_file(path: str) -> str:
    """Read contents of a file."""
    try:
        file_path = _resolve_path(path)
        if not file_path.exists():
            return f"Error: File not found: {path} (resolved to {file_path})"
        if file_path.stat().st_size > 500_000:
            return f"Error: File too large (>500KB)"
        return file_path.read_text(encoding="utf-8")
    except Exception as e:
        return f"Read error: {e}"


def write_file(path: str, content: str) -> str:
    """Write content to a file. Creates directories if needed."""
    try:
        file_path = _resolve_path(path)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content, encoding="utf-8")
        return f"✅ Written: {file_path} ({len(content)} chars)"
    except Exception as e:
        return f"Write error: {e}"


def create_project(name: str, structure) -> str:
    """Create an entire project with multiple files at once."""
    try:
        if isinstance(structure, str):
            try:
                structure = json.loads(structure)
            except Exception:
                import ast
                try:
                    structure = ast.literal_eval(structure)
                except Exception:
                    return f"Project creation error: 'structure' must be a dictionary or a valid JSON string representing a dictionary."

        if not isinstance(structure, dict):
            return f"Project creation error: 'structure' must be a dictionary, got {type(structure).__name__}"

        # Always create project inside workspace
        workspace = _get_workspace()
        workspace.mkdir(parents=True, exist_ok=True)
        project_path = (workspace / name).resolve()
        project_path.mkdir(parents=True, exist_ok=True)

        created_files = []
        for file_path, content in structure.items():
            if isinstance(content, dict):
                content = content.get("content", content.get("code", json.dumps(content)))
            elif not isinstance(content, str):
                content = str(content)

            full_path = project_path / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")
            created_files.append(str(file_path))

        return (
            f"✅ Project '{name}' created in {project_path} with {len(created_files)} files:\n"
            + "\n".join(f"  📄 {f}" for f in created_files)
        )
    except Exception as e:
        return f"Project creation error: {e}"


def edit_file(path: str, old_text: str, new_text: str) -> str:
    """Replace specific text in a file."""
    try:
        file_path = _resolve_path(path)
        if not file_path.exists():
            return f"Error: File not found: {path} (resolved to {file_path})"

        content = file_path.read_text(encoding="utf-8")
        if old_text not in content:
            return f"Error: Could not find the specified text in {path}"

        new_content = content.replace(old_text, new_text, 1)
        file_path.write_text(new_content, encoding="utf-8")
        return f"✅ Edited {file_path}"
    except Exception as e:
        return f"Edit error: {e}"


def append_file(path: str, content: str) -> str:
    """Append content to end of a file."""
    try:
        file_path = _resolve_path(path)
        if not file_path.exists():
            return f"Error: File not found: {path}. Use write_file to create it."
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(content)
        return f"✅ Appended to {file_path} ({len(content)} chars)"
    except Exception as e:
        return f"Append error: {e}"


def list_files(directory: str = "") -> str:
    """List files in a directory recursively (up to 3 levels)."""
    try:
        if directory:
            dir_path = _resolve_path(directory)
        else:
            dir_path = _get_workspace()

        if not dir_path.exists():
            return f"Error: Directory not found: {dir_path}"

        entries = []
        _list_recursive(dir_path, entries, depth=0, max_depth=3)
        return "\n".join(entries) if entries else "(Empty directory)"
    except Exception as e:
        return f"List error: {e}"


def _list_recursive(path: Path, entries: list, depth: int, max_depth: int):
    skip_dirs = {".git", "node_modules", "__pycache__", ".venv", "venv", ".next", "dist", "build"}
    try:
        for item in sorted(path.iterdir()):
            if item.name in skip_dirs:
                continue
            indent = "  " * depth
            if item.is_dir():
                entries.append(f"{indent}📁 {item.name}/")
                if depth < max_depth:
                    _list_recursive(item, entries, depth + 1, max_depth)
            else:
                size = item.stat().st_size
                entries.append(f"{indent}📄 {item.name} ({size}B)")
    except PermissionError:
        pass


# Memory tools - these get their implementations injected by the agent
def remember(text: str) -> str:
    """Placeholder - actual implementation injected by agent."""
    return "Memory not initialized"


def recall(query: str) -> str:
    """Placeholder - actual implementation injected by agent."""
    return "Memory not initialized"


def search_knowledge(query: str) -> str:
    """Placeholder - actual implementation injected by agent."""
    return "Knowledge base not initialized"


# Import media tools
from media_tools import generate_image, generate_video


# Tool registry
TOOLS = {
    "web_search": web_search,
    "calculate": calculate,
    "run_python": run_python,
    "run_shell": run_shell,
    "read_file": read_file,
    "write_file": write_file,
    "edit_file": edit_file,
    "append_file": append_file,
    "create_project": create_project,
    "list_files": list_files,
    "remember": remember,
    "recall": recall,
    "search_knowledge": search_knowledge,
    "generate_image": generate_image,
    "generate_video": generate_video,
}


def execute_tool(name: str, arguments: dict) -> str:
    """Execute a tool by name with given arguments."""
    if name not in TOOLS:
        return f"Error: Unknown tool '{name}'. Available: {list(TOOLS.keys())}"
    try:
        return TOOLS[name](**arguments)
    except TypeError as e:
        return f"Error: Invalid arguments for '{name}': {e}"
