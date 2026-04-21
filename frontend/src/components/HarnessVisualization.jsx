import React, { useEffect, useState, useMemo } from 'react';

export default function HarnessVisualization({ loopNodes, onSelect }) {
  const width = 720;
  const height = 560;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 210;

  const positions = useMemo(() => {
    const n = loopNodes.length;
    return loopNodes.map((node, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { ...node, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), angle };
    });
  }, [loopNodes]);

  const [pulseIdx, setPulseIdx] = useState(0);
  const [pulseT, setPulseT] = useState(0);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setPulseT((t) => {
        const nt = t + dt * 0.55;
        if (nt >= 1) {
          setPulseIdx((i) => (i + 1) % positions.length);
          return 0;
        }
        return nt;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [positions.length]);

  const pulsePos = useMemo(() => {
    if (!positions.length) return { x: cx, y: cy };
    const a = positions[pulseIdx];
    const b = positions[(pulseIdx + 1) % positions.length];
    // Ease in-out for smoother feel
    const ease = pulseT < 0.5 ? 2 * pulseT * pulseT : -1 + (4 - 2 * pulseT) * pulseT;
    return { x: a.x + (b.x - a.x) * ease, y: a.y + (b.y - a.y) * ease };
  }, [positions, pulseIdx, pulseT]);

  return (
    <svg
      className="viz-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Claude Code Harness loop visualization"
    >
      <defs>
        {/* Gradient for ring track */}
        <radialGradient id="ring-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.04)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </radialGradient>

        {/* Node fill gradient */}
        <radialGradient id="node-fill" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1e2440" />
          <stop offset="100%" stopColor="#141928" />
        </radialGradient>

        {/* Glow filter for pulse */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Arrowhead */}
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0.5 L7,3 L0,5.5 z" fill="rgba(99,102,241,0.35)" />
        </marker>
      </defs>

      {/* Subtle background ring glow */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="80" />

      {/* Ring track */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="1" strokeDasharray="3 5" />

      {/* Edges */}
      {positions.map((p, i) => {
        const next = positions[(i + 1) % positions.length];
        const mx = (p.x + next.x) / 2;
        const my = (p.y + next.y) / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const bulge = 28;
        return (
          <path
            key={`e-${i}`}
            className="edge"
            d={`M ${p.x} ${p.y} Q ${mx + (dx / len) * bulge} ${my + (dy / len) * bulge} ${next.x} ${next.y}`}
            markerEnd="url(#arrowhead)"
          />
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy - 10} className="center-label">Harness Loop</text>
      <text x={cx} y={cy + 10} className="center-sub">click any stage to inspect</text>

      {/* Traveling pulse */}
      <circle
        cx={pulsePos.x}
        cy={pulsePos.y}
        r={6}
        className="pulse"
        filter="url(#glow)"
      />

      {/* Nodes */}
      {positions.map((p) => {
        const isGate = p.id === 'permission_gate';
        return (
          <g
            key={p.id}
            className={`node${isGate ? ' gate' : ''}`}
            transform={`translate(${p.x}, ${p.y})`}
            tabIndex={0}
            role="button"
            aria-label={`${p.title}. ${p.short}`}
            onClick={() => onSelect(p.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(p.id);
              }
            }}
          >
            <circle r={46} fill="url(#node-fill)" />
            {splitLabel(p.title).map((line, i, arr) => (
              <text key={i} y={i * 13 - (arr.length - 1) * 6.5}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function splitLabel(title) {
  const words = title.split(' ');
  if (words.length === 1) return words;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}
