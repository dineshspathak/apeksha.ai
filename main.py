"""Apeksha AI - CLI Interface."""

from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.text import Text
from rich.table import Table

from agent import Apeksha
from config import AGENT_NAME, AGENT_VERSION, AGENT_TAGLINE, MODEL


def main():
    console = Console()

    # Welcome banner
    console.print()
    console.print(Panel(
        f"[bold cyan]🙏 {AGENT_NAME} AI[/bold cyan] [dim]v{AGENT_VERSION}[/dim]\n"
        f"[italic]{AGENT_TAGLINE}[/italic]\n\n"
        f"Model: [green]{MODEL}[/green] (via Ollama)\n"
        f"I can build software, search the web, remember things, and learn from your documents.\n\n"
        f"Type [bold]/help[/bold] for commands, [bold]/quit[/bold] to exit",
        title=f"✨ {AGENT_NAME}",
        border_style="cyan",
        padding=(1, 2),
    ))

    agent = Apeksha()

    while True:
        try:
            console.print()
            user_input = console.input("[bold green]You:[/bold green] ").strip()

            if not user_input:
                continue

            if user_input.startswith("/"):
                handle_command(user_input, agent, console)
                continue

            # Process with agent
            console.print()
            console.print(f"[bold cyan]{AGENT_NAME}:[/bold cyan]")

            for msg_type, content in agent.chat_stream(user_input):
                if msg_type == "tool_start":
                    console.print(Text(f"  {content}", style="dim yellow"))
                elif msg_type == "tool_result":
                    lines = content.split("\n")
                    preview = "\n    ".join(lines[:5])
                    if len(lines) > 5:
                        preview += f"\n    ... ({len(lines) - 5} more lines)"
                    console.print(Text(f"    ↳ {preview}", style="dim"))
                elif msg_type == "response":
                    console.print()
                    console.print(Markdown(content))

        except KeyboardInterrupt:
            console.print("\n[dim]Interrupted. Use /quit to exit[/dim]")
            continue
        except EOFError:
            break

    console.print(f"\n[dim]{AGENT_NAME} says goodbye! 🙏[/dim]")


def handle_command(command: str, agent: Apeksha, console: Console):
    """Handle slash commands."""
    parts = command.strip().split(maxsplit=1)
    cmd = parts[0].lower()
    arg = parts[1] if len(parts) > 1 else ""

    if cmd in ("/quit", "/exit", "/q"):
        console.print(f"[dim]{AGENT_NAME} says goodbye! 🙏[/dim]")
        raise SystemExit(0)

    elif cmd == "/reset":
        agent.reset()
        console.print("[yellow]🔄 Conversation reset.[/yellow]")

    elif cmd == "/status":
        status = agent.get_status()
        table = Table(title=f"{AGENT_NAME} Status", border_style="cyan")
        table.add_column("Property", style="bold")
        table.add_column("Value", style="green")
        for key, value in status.items():
            table.add_row(key.replace("_", " ").title(), str(value))
        console.print(table)

    elif cmd == "/ingest":
        directory = arg if arg else None
        console.print("[dim]📚 Ingesting documents into knowledge base...[/dim]")
        result = agent.ingest_knowledge(directory)
        console.print(f"[green]{result}[/green]")

    elif cmd == "/help":
        console.print(Panel(
            "[bold]/quit[/bold]          - Exit Apeksha\n"
            "[bold]/reset[/bold]         - Clear conversation history\n"
            "[bold]/status[/bold]        - Show agent status (memories, model, etc.)\n"
            "[bold]/ingest[/bold] [path] - Ingest documents into knowledge base\n"
            "[bold]/web[/bold]           - Start the web UI\n"
            "[bold]/help[/bold]          - Show this help\n\n"
            "[bold]Tips:[/bold]\n"
            '  • Drop files in ./knowledge/ and use /ingest to teach Apeksha\n'
            '  • Ask "remember that ..." to save to long-term memory\n'
            '  • Ask "what do you remember about ..." to recall\n\n'
            "[bold]Example prompts:[/bold]\n"
            '  "Build a React todo app"\n'
            '  "Create a Python REST API with Flask"\n'
            '  "Search the web for latest Python news"\n'
            '  "Remember that my project uses PostgreSQL"\n'
            '  "What do you know about my project?"',
            title="Commands & Tips",
            border_style="blue",
        ))

    elif cmd == "/web":
        console.print("[cyan]Starting web UI...[/cyan]")
        console.print("[green]Open http://127.0.0.1:5000 in your browser[/green]")
        from web_ui import start_web_ui
        start_web_ui()

    elif cmd == "/update":
        console.print("[cyan]🔄 Checking for updates...[/cyan]")
        from updater import run_full_update
        result = run_full_update()
        console.print(f"[green]{result}[/green]")

    else:
        console.print(f"[red]Unknown command: {command}[/red]. Type /help")


if __name__ == "__main__":
    main()
