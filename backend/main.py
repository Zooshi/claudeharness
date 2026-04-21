"""FastAPI entrypoint.

Routes:
  GET  /api/health       basic liveness
  GET  /api/nodes        visualization content (loop stages + concepts)
  POST /api/chat         forward a user question to the local Ollama model
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from chat import answer
from content import NODES

log = logging.getLogger("harness.api")

app = FastAPI(title="Claude Code Harness Explainer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    answer: str


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/nodes")
async def nodes() -> list[dict]:
    return NODES


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    try:
        text = await answer(req.question)
    except Exception as exc:
        log.exception("chat failed")
        raise HTTPException(
            status_code=502,
            detail=(
                "Could not reach the local Ollama model. Make sure Ollama is "
                "running on the host and that the 'qwen3.5:latest' model is "
                f"pulled. Underlying error: {exc}"
            ),
        )
    return ChatResponse(answer=text)
