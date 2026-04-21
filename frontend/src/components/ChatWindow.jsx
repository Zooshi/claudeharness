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
        <div className="chat-header-avatar" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L13.5 4.75V11.25L8 14.5L2.5 11.25V4.75L8 1.5Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="8" cy="8" r="2" fill="white" />
          </svg>
        </div>
        <div>
          <div className="title">Ask the harness</div>
          <div className="sub">local Ollama &middot; qwen3.5</div>
        </div>
        <button
          className="icon-btn"
          aria-label="Close chat"
          onClick={onClose}
          style={{ marginLeft: 'auto' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </header>

      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && !busy && (
          <div className="chat-empty">
            <div className="chat-empty-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10.5a8 8 0 0 1-1.6 4.8 8 8 0 0 1-6.4 3.2 7.9 7.9 0 0 1-4-.9L2 19l1.9-4.1a7.9 7.9 0 0 1-1.9-5A8 8 0 0 1 10 2a8 8 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <p>
              Ask anything about the loop — e.g. &ldquo;What happens at the permission
              gate?&rdquo; or &ldquo;How does context compaction work?&rdquo;
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="msg assistant typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </div>

      <form className="chat-input" onSubmit={send}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={busy}
          aria-label="Chat input"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={busy || !input.trim()}
          aria-label="Send"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2L2 7.5l4.5 1.5M14 2L9.5 14 8 9.5M14 2L6.5 9.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
