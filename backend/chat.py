"""PydanticAI agent wired to a locally-running Ollama model.

Ollama exposes an OpenAI-compatible endpoint at /v1, so we use PydanticAI's
OpenAI model class with a custom base URL. Logging goes through logfire in
console-only mode (no token required) so every model interaction shows up
in the container logs.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass

import logfire
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from content import nodes_for_prompt

logfire.configure(send_to_logfire=False, service_name="harness-explainer")
logfire.instrument_pydantic_ai()

log = logging.getLogger("harness.chat")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


SYSTEM_PROMPT = f"""You are an assistant embedded in an interactive visualization \
of the Claude Code Harness, built in Deutsche Bahn house style. You help users \
understand how the harness loop works: context assembly, model inference, \
response parsing, the permission gate, tool execution, tool results, loop \
decisions, context compaction, hooks, subagents, skills, and MCP servers.

Rules:
- Answer in 3-6 sentences unless the user asks for depth.
- Ground answers in the visualization's concepts (below). If a question is \
unrelated to Claude Code, politely redirect.
- Do not invent APIs, flags, or tool names. If unsure, say so.

Visualization concepts:
{nodes_for_prompt()}
"""


@dataclass
class ChatDeps:
    pass


def _build_agent() -> Agent[ChatDeps, str]:
    base_url = os.environ.get("OLLAMA_BASE_URL", "http://host.docker.internal:11434/v1")
    model_name = os.environ.get("OLLAMA_MODEL", "qwen3.5:latest")
    log.info("wiring PydanticAI agent to ollama base_url=%s model=%s", base_url, model_name)

    model = OpenAIChatModel(
        model_name=model_name,
        provider=OpenAIProvider(base_url=base_url, api_key="ollama"),
    )
    return Agent(model, system_prompt=SYSTEM_PROMPT, deps_type=ChatDeps)


_agent: Agent[ChatDeps, str] | None = None


def get_agent() -> Agent[ChatDeps, str]:
    global _agent
    if _agent is None:
        _agent = _build_agent()
    return _agent


async def answer(question: str) -> str:
    agent = get_agent()
    with logfire.span("chat.answer", question=question):
        result = await agent.run(question, deps=ChatDeps())
        log.info("chat response tokens\u2248%d", len(result.output.split()))
        return result.output
