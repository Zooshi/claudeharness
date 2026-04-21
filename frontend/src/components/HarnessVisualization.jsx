import React, { useEffect, useState, useMemo } from 'react';

/**
 * Circular SVG of the Claude Code Harness loop. Each ring node is clickable
 * and opens a modal. The dashed node is the Permission Gate — emphasised as
 * a safety checkpoint. A red pulse travels the loop to hint at motion.
 */
export default function HarnessVisualization({ loopNodes, onSelect }) {
  const width = 720;
  const height = 560;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 210;

  // Nodes go clockwise starting at 12 o'clock.
  const positions = useMemo(() => {
    const n = loopNodes.length;
    return loopNodes.map((node, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return {
        ...node,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle,
      };
    });
  }, [loopNodes]);

  // Animated pulse that walks the ring.
  const [pulseIdx, setPulseIdx] = useState(0);
  const [pulseT, setPulseT] = useState(0);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setPulseT((t) => {
        const nt = t + dt * 0.6;
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
    return {
      x: a.x + (b.x - a.x) * pulseT,
      y: a.y + (b.y - a.y) * pulseT,
    };
  }, [positions, pulseIdx, pulseT]);

  return (
    <svg
      className="viz-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Claude Code Harness loop visualization"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6 z" fill="var(--db-gray-300)" />
        </marker>
      </defs>

      {/* ring edges */}
      {positions.map((p, i) => {
        const next = positions[(i + 1) % positions.length];
        // Curve slightly along the circle.
        const mx = (p.x + next.x) / 2;
        const my = (p.y + next.y) / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const bulge = 30;
        const bx = mx + (dx / len) * bulge;
        const by = my + (dy / len) * bulge;
        return (
          <path
            key={`e-${i}`}
            className="edge"
            d={`M ${p.x} ${p.y} Q ${bx} ${by} ${next.x} ${next.y}`}
            markerEnd="url(#arrowhead)"
          />
        );
      })}

      {/* center label */}
      <text x={cx} y={cy - 8} className="center-label">
        The Harness Loop
      </text>
      <text x={cx} y={cy + 12} className="center-sub">
        click any stage to inspect
      </text>

      {/* travelling pulse */}
      <circle className="pulse" cx={pulsePos.x} cy={pulsePos.y} r={7} />

      {/* nodes */}
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
            <circle r={48} />
            {splitLabel(p.title).map((line, i, arr) => (
              <text key={i} y={i * 13 - (arr.length - 1) * 6}>
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
  // Greedy wrap at ~2 words per line for tight node circles.
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}
