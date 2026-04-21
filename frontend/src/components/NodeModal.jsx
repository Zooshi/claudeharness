import React, { useEffect } from 'react';

export default function NodeModal({ node, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!node) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h3 id="modal-title">{node.title}</h3>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </header>
        <div className="body">
          <span className="tag">
            {node.category === 'loop' ? 'Loop stage' : 'Cross-cutting concept'}
          </span>
          <p><strong>{node.short}</strong></p>
          <p>{node.detail}</p>
        </div>
      </div>
    </div>
  );
}
