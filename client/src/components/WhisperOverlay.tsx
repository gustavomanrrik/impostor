import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';

interface WhisperAnim {
  id: string;
  senderId: string;
  targetId: string;
  text: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  createdAt: number;
}

const DURATION_MS = 3500;

/** Gets center coords of a [data-player-id] element, or falls back to edge of screen */
function getPlayerCenter(playerId: string, fallback: 'left' | 'right'): { x: number; y: number } {
  const el = document.querySelector<HTMLElement>(`[data-player-id="${playerId}"]`);
  if (el) {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  // Fallback when element not found (e.g., sender is in a different panel)
  return {
    x: fallback === 'left' ? window.innerWidth * 0.15 : window.innerWidth * 0.85,
    y: window.innerHeight * 0.5,
  };
}

export function WhisperOverlay() {
  const { activeWhispers, playerId } = useGame();
  const [anims, setAnims] = useState<WhisperAnim[]>([]);
  const seenIds = useRef<Set<string>>(new Set());

  // When activeWhispers changes, compute positions for NEW whispers only
  useEffect(() => {
    const newAnims: WhisperAnim[] = [];

    for (const w of activeWhispers) {
      if (seenIds.current.has(w.id)) continue;
      seenIds.current.add(w.id);

      // Small RAF delay so the DOM has the elements rendered
      const sender = getPlayerCenter(w.senderId, 'left');
      const target = getPlayerCenter(w.targetId, 'right');

      newAnims.push({
        id: w.id,
        senderId: w.senderId,
        targetId: w.targetId,
        text: w.text,
        startX: sender.x,
        startY: sender.y,
        endX: target.x,
        endY: target.y,
        createdAt: Date.now(),
      });
    }

    if (newAnims.length > 0) {
      setAnims(prev => [...prev, ...newAnims]);
    }
  }, [activeWhispers]);

  // Auto-remove expired animations
  useEffect(() => {
    if (anims.length === 0) return;
    const oldest = Math.min(...anims.map(a => a.createdAt));
    const remaining = DURATION_MS - (Date.now() - oldest);
    const timer = setTimeout(() => {
      const now = Date.now();
      setAnims(prev => prev.filter(a => now - a.createdAt < DURATION_MS + 200));
    }, Math.max(remaining, 100));
    return () => clearTimeout(timer);
  }, [anims]);

  // Also clean up if whisper was removed from context (by server timeout)
  useEffect(() => {
    const activeIds = new Set(activeWhispers.map(w => w.id));
    setAnims(prev => {
      const filtered = prev.filter(a => activeIds.has(a.id) || Date.now() - a.createdAt < DURATION_MS + 500);
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [activeWhispers]);

  if (anims.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes whisperBalloon {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(-5deg); }
          12%  { opacity: 1; transform: translate(-50%, -50%) scale(1.1) rotate(2deg); }
          20%  { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          75%  { opacity: 1; }
          90%  { opacity: 1; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.5) rotate(3deg); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 999999,
        }}
      >
        {anims.map(anim => {
          const isPrivileged = anim.senderId === playerId || anim.targetId === playerId;
          const deltaX = anim.endX - anim.startX;
          const deltaY = anim.endY - anim.startY;

          return (
            <div
              key={anim.id}
              style={{
                position: 'absolute',
                left: anim.startX,
                top: anim.startY,
                // CSS custom props for keyframe target offset
                ['--dx' as any]: `${deltaX}px`,
                ['--dy' as any]: `${deltaY}px`,
                animation: `whisperBalloon ${DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                willChange: 'transform, opacity',
              }}
            >
              {/* Speech bubble */}
              <div
                style={{
                  transform: 'translate(-50%, -50%)',
                  background: isPrivileged ? '#fff9c4' : 'var(--bg-card, #fff)',
                  color: '#000',
                  padding: '8px 14px',
                  border: '3px solid #000',
                  boxShadow: '3px 3px 0 #000',
                  fontFamily: 'var(--font-display, "Comic Sans MS", cursive)',
                  fontWeight: 700,
                  fontSize: '14px',
                  maxWidth: '200px',
                  minWidth: '60px',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  position: 'relative',
                  whiteSpace: isPrivileged ? 'pre-wrap' : 'nowrap',
                }}
              >
                {isPrivileged ? `💬 ${anim.text}` : '🤫'}

                {/* Tail pointing down-left (toward sender origin feel) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '20px',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '10px solid #000',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-7px',
                    left: '21px',
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '3px solid transparent',
                    borderTop: `9px solid ${isPrivileged ? '#fff9c4' : 'var(--bg-card, #fff)'}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
