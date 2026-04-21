import React, { useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const send = async (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'error', text: String(err.message || err) }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="chat-window" role="dialog" aria-label="Ask about the harness">
      <header>
        <div>
          <div className="title">Ask the harness</div>
          <div className="sub">powered by local Ollama &middot; qwen3.5</div>
        </div>
        <button
          className="icon-btn"
          aria-label="Close chat"
          onClick={onClose}
          style={{ marginLeft: 'auto' }}
        >
          &times;
        </button>
      </header>
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && !busy && (
          <div className="chat-empty">
            Ask anything about the loop &mdash; e.g. &ldquo;What happens at the
            permission gate?&rdquo; or &ldquo;How does context compaction work?&rdquo;
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="msg assistant">
            <span className="typing">&bull;</span>
            <span className="typing" style={{ animationDelay: '0.2s' }}>&bull;</span>
            <span className="typing" style={{ animationDelay: '0.4s' }}>&bull;</span>
          </div>
        )}
      </div>
      <form className="chat-input" onSubmit={send}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={busy}
          aria-label="Chat input"
        />
        <button type="submit" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
