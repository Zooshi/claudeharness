# Claude Code Harness Explorer

An interactive, Deutsche-Bahn-themed visualization of the Claude Code harness
loop. Click any stage in the ring to read what happens there, or use the red
chat bubble (bottom right) to ask questions &mdash; answered by a locally
hosted Ollama model through PydanticAI.

- **Frontend:** React (Vite)
- **Backend:** FastAPI + PydanticAI, instrumented with Logfire
- **LLM:** Ollama on your host machine, model `qwen3.5:latest`

## Prerequisites

1. **Docker Desktop** (or Docker Engine + Compose plugin).
2. **Ollama** running on the *host*, not inside Docker:
   ```bash
   ollama serve           # exposes http://localhost:11434
   ollama pull qwen3.5:latest
   ```
   The backend container reaches your host via `host.docker.internal`
   (configured in `docker-compose.yml` with `extra_hosts: host-gateway`, which
   makes this work on Linux as well as macOS/Windows).

## Run it

From this directory:

```bash
docker compose up --build
```

Then open:

- Visualization: http://localhost:5173
- API docs:      http://localhost:8000/docs

Stop with `Ctrl+C`, or `docker compose down` to remove the containers. Nothing
is persisted &mdash; no sessions, no chat history.

## Project layout

```
backend/     FastAPI app, PydanticAI agent, node/content definitions
frontend/    Vite + React app, SVG ring visualization, chat pop-up
docker-compose.yml
```

## What the visualization covers

- **Loop stages:** user input, context assembly, model inference, response
  parsing, **permission gate**, tool execution, tool result, loop decision.
- **Cross-cutting concepts:** context &amp; memory, tools &amp; MCP,
  subagents &amp; skills, hooks.

## Troubleshooting

- **Chat returns a 502 about reaching Ollama:** make sure `ollama serve` is
  running on the host and that `qwen3.5:latest` has been pulled. Test from
  your host with `curl http://localhost:11434/api/tags`.
- **Linux users:** the `extra_hosts: host-gateway` line in `docker-compose.yml`
  already handles `host.docker.internal` &mdash; no extra setup required.
- **Model name:** the brief specifies `qwen3.5:latest`. If your local Ollama
  has a different tag installed, override via
  `OLLAMA_MODEL=qwen3:latest docker compose up` (or edit the compose file).
