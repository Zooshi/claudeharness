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
        <span className="db-mark">DB</span>
        <h1>Claude Code Harness Explorer</h1>
        <span className="subtitle">Deutsche Bahn house style</span>
      </div>

      <main className="app">
        <section className="intro">
          <h2>How does Claude Code actually work?</h2>
          <p>
            The Claude Code harness runs a loop every time you talk to Claude.
            Follow the red pulse around the ring, or click any stage to read
            what it does. The dashed node is the <strong>permission gate</strong>
            &mdash; the safety checkpoint between what the model asks for and
            what actually runs on your machine.
          </p>
        </section>

        <section className="stage">
          <div className="viz-card">
            {loadError && (
              <p style={{ color: 'var(--db-red-dark)', margin: 0 }}>
                Could not load visualization content: {loadError}
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
            <h3>Cross-cutting concepts</h3>
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
          Demo app &middot; no sessions, nothing stored &middot; chat runs
          against a locally-hosted Ollama model on your machine.
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
