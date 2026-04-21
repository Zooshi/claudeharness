import React, { useEffect, useMemo, useState } from 'react';
import HarnessVisualization from './components/HarnessVisualization.jsx';
import NodeModal from './components/NodeModal.jsx';
import ChatBubble from './components/ChatBubble.jsx';
import ChatWindow from './components/ChatWindow.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/nodes`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setNodes)
      .catch((e) => setLoadError(String(e.message || e)));
  }, []);

  const loopNodes = useMemo(() => nodes.filter((n) => n.category === 'loop'), [nodes]);
  const conceptNodes = useMemo(() => nodes.filter((n) => n.category === 'concept'), [nodes]);
  const selected = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  return (
    <>
      <div className="topbar">
        <div className="logo-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L15.5 5.5V12.5L9 16L2.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
            <circle cx="9" cy="9" r="2.5" fill="white" />
          </svg>
        </div>
        <span className="topbar-title">Claude Code Harness</span>
        <div className="topbar-divider" aria-hidden="true" />
        <span className="topbar-subtitle">Explorer</span>
        <span className="topbar-badge">v1.0</span>
      </div>

      <main className="app">
        <section className="intro">
          <div className="intro-eyebrow">Interactive Visualisation</div>
          <h2>How Claude Code works under the hood</h2>
          <p>
            The Claude Code harness runs a loop each time you interact with Claude.
            Follow the pulse around the ring, or click any stage to read what it does.
            The dashed node is the <strong>permission gate</strong> — the safety
            checkpoint between what the model requests and what runs on your machine.
          </p>
        </section>

        <section className="stage">
          <div className="viz-card">
            {loadError && (
              <p className="load-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM7.25 4.75a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0v-4zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z"/>
                </svg>
                Could not load visualization: {loadError}
              </p>
            )}
            {!loadError && loopNodes.length > 0 && (
              <HarnessVisualization
                loopNodes={loopNodes}
                onSelect={setSelectedId}
              />
            )}
          </div>

          <aside className="concepts">
            <h3 className="concepts-heading">Cross-cutting concepts</h3>
            {conceptNodes.map((c) => (
              <button
                key={c.id}
                className="concept-card"
                onClick={() => setSelectedId(c.id)}
                type="button"
              >
                <div className="title">{c.title}</div>
                <div className="desc">{c.short}</div>
              </button>
            ))}
          </aside>
        </section>

        <footer className="footer">
          Demo app &middot; no sessions stored &middot; chat runs against a
          locally-hosted Ollama model
        </footer>
      </main>

      <NodeModal node={selected} onClose={() => setSelectedId(null)} />

      {chatOpen ? (
        <ChatWindow onClose={() => setChatOpen(false)} />
      ) : (
        <ChatBubble onClick={() => setChatOpen(true)} />
      )}
    </>
  );
}
