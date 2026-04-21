import React, { useEffect } from 'react';

export default function NodeModal({ node, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!node) return null;

  const isGate = node.id === 'permission_gate';
  const isLoop = node.category === 'loop';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <h3 id="modal-title">{node.title}</h3>
            <span className={`tag${isGate ? ' gate-tag' : ''}`}>
              {isLoop ? 'Loop stage' : 'Cross-cutting concept'}
            </span>
          </div>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        <div className="modal-divider" />

        <div className="body">
          <p><strong>{node.short}</strong></p>
          <p>{node.detail}</p>
        </div>
      </div>
    </div>
  );
}
