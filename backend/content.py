"""Static content describing the Claude Code Harness loop stages and concepts.

Consumed by the frontend visualization (/api/nodes) and also injected into the
chat model's system prompt so it can answer grounded questions.
"""

NODES: list[dict] = [
    {
        "id": "user_input",
        "title": "User Input",
        "category": "loop",
        "short": "The user's prompt enters the harness.",
        "detail": (
            "Every iteration of the loop starts with a user message. The harness "
            "captures the raw input, fires any UserPromptSubmit hooks, and appends "
            "it to the running conversation transcript before handing control to "
            "the context assembly step."
        ),
    },
    {
        "id": "context_assembly",
        "title": "Context Assembly",
        "category": "loop",
        "short": "System prompt + CLAUDE.md + memory + tool schemas are merged.",
        "detail": (
            "Before every model call the harness assembles the full context window: "
            "the built-in system prompt, CLAUDE.md policy files (user, project, "
            "sub-directory), relevant memory records, declared tool schemas, "
            "skill descriptions, and the conversation transcript. This is what the "
            "model actually sees on each turn."
        ),
    },
    {
        "id": "model_inference",
        "title": "Model Inference",
        "category": "loop",
        "short": "Claude generates the next message \u2014 text and/or tool calls.",
        "detail": (
            "The harness calls the Anthropic API with the assembled context. "
            "Claude responds with a mix of visible text and structured tool_use "
            "blocks. The response is streamed so the user sees tokens as soon as "
            "they are generated."
        ),
    },
    {
        "id": "parse_response",
        "title": "Parse Response",
        "category": "loop",
        "short": "Harness separates text, tool calls, and stop reason.",
        "detail": (
            "The harness inspects the model output: plain text is streamed to the "
            "UI, tool_use blocks are queued for execution, and the stop_reason "
            "decides whether we loop again (end_turn vs. tool_use). Malformed "
            "tool calls are caught here."
        ),
    },
    {
        "id": "permission_gate",
        "title": "Permission Gate",
        "category": "loop",
        "short": "Allow / ask / deny \u2014 the safety checkpoint before any tool runs.",
        "detail": (
            "For every queued tool call the harness consults the active permission "
            "mode and the allow/deny rules in settings.json. Depending on the "
            "outcome it either executes silently (allow), prompts the user "
            "(ask), or blocks the call (deny). Dangerous operations like "
            "destructive Bash, network writes, or paths outside the sandbox are "
            "gated here."
        ),
    },
    {
        "id": "tool_execution",
        "title": "Tool Execution",
        "category": "loop",
        "short": "Built-in tools and MCP servers actually do the work.",
        "detail": (
            "Approved calls are dispatched: built-in tools (Read, Edit, Write, "
            "Grep, Glob, Bash) run in-process; MCP tools are routed to the "
            "configured MCP server over stdio or HTTP; Agent spawns an isolated "
            "sub-conversation. Tool execution is sandboxed according to the "
            "current permission mode."
        ),
    },
    {
        "id": "tool_result",
        "title": "Tool Result",
        "category": "loop",
        "short": "Output is packaged and fed back to the model.",
        "detail": (
            "Each tool returns a structured result (text, file contents, exit "
            "code, errors). The harness wraps it in a tool_result block tied to "
            "the original tool_use_id, appends it to the transcript, and fires "
            "PostToolUse hooks before looping."
        ),
    },
    {
        "id": "loop_decision",
        "title": "Loop Decision",
        "category": "loop",
        "short": "Continue the loop or return control to the user?",
        "detail": (
            "If the last model message ended with stop_reason=tool_use, the "
            "harness jumps back to Context Assembly with the new tool results in "
            "scope. If it ended with end_turn, the loop exits and the user gets "
            "the prompt back."
        ),
    },
    {
        "id": "context_memory",
        "title": "Context & Memory",
        "category": "concept",
        "short": "Context window management, compaction, CLAUDE.md, memory files.",
        "detail": (
            "The context window is finite. Claude Code auto-compacts older "
            "messages when usage approaches the limit, replacing them with a "
            "summary. CLAUDE.md files (user-global, project, sub-directory) are "
            "always loaded. Long-lived facts live in the file-based memory "
            "system; session state is ephemeral and not persisted."
        ),
    },
    {
        "id": "tools_mcp",
        "title": "Tools & MCP",
        "category": "concept",
        "short": "Built-in tools, MCP servers, deferred tools, permissions.",
        "detail": (
            "Built-in tools cover filesystem, shell, and search. External "
            "capabilities plug in via the Model Context Protocol \u2014 each MCP "
            "server exposes its own tools under a namespaced prefix. Deferred "
            "tools have names but no schema until fetched via ToolSearch, which "
            "keeps the initial context small."
        ),
    },
    {
        "id": "subagents_skills",
        "title": "Subagents & Skills",
        "category": "concept",
        "short": "Isolated sub-loops and reusable capability bundles.",
        "detail": (
            "The Agent tool spawns a fresh loop with its own context window and "
            "an optional git-worktree sandbox. Skills are markdown-defined "
            "capability bundles loaded on demand via the Skill tool. Slash "
            "commands map to skills. Both keep the parent context clean."
        ),
    },
    {
        "id": "hooks",
        "title": "Hooks",
        "category": "concept",
        "short": "Shell commands the harness runs on lifecycle events.",
        "detail": (
            "Hooks are configured in settings.json and fire on events like "
            "UserPromptSubmit, PreToolUse, PostToolUse, and Stop. They can "
            "block a tool call, inject context, or run arbitrary commands. "
            "Hook output is fed back to the model as if it came from the user."
        ),
    },
]


def nodes_for_prompt() -> str:
    """Condense node content into a compact string for the chat system prompt."""
    parts = []
    for n in NODES:
        parts.append(f"- {n['title']} ({n['category']}): {n['short']} {n['detail']}")
    return "\n".join(parts)
