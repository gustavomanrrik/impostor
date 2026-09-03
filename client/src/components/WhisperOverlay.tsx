import React, { useLayoutEffect, useRef, useState } from 'react';
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
}

export function WhisperOverlay() {
  const { activeWhispers, playerId } = useGame();
  const [animations, setAnimations] = useState<WhisperAnim[]>([]);
  const processedIds = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    if (activeWhispers.length === 0) {
      setAnimations([]);
      processedIds.current.clear();
      return;
    }

    const newAnims: WhisperAnim[] = [];
    
    activeWhispers.forEach(whisper => {
      if (processedIds.current.has(whisper.id)) return;
      processedIds.current.add(whisper.id);

      // Find elements by data attribute
      const senderEl = document.querySelector<HTMLElement>(`[data-player-id="${whisper.senderId}"]`);
      const targetEl = document.querySelector<HTMLElement>(`[data-player-id="${whisper.targetId}"]`);

      let startX = window.innerWidth / 2;
      let startY = window.innerHeight * 0.8;
      let endX = window.innerWidth / 2;
      let endY = window.innerHeight * 0.2;

      if (senderEl) {
        const rect = senderEl.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      }

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        endX = rect.left + rect.width / 2;
        endY = rect.top + rect.height / 2;
      }

      newAnims.push({
        ...whisper,
        startX,
        startY,
        endX,
        endY,
      });
    });

    if (newAnims.length > 0) {
      setAnimations(prev => {
        // Keep existing, add new
        const existingIds = new Set(prev.map(a => a.id));
        const toAdd = newAnims.filter(a => !existingIds.has(a.id));
        return [...prev, ...toAdd];
      });
    }

    // Clean up animations that are no longer in activeWhispers
    const activeIds = new Set(activeWhispers.map(w => w.id));
    setAnimations(prev => prev.filter(a => activeIds.has(a.id)));

  }, [activeWhispers]);

  if (animations.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 999999 }}>
      {animations.map(anim => {
        const isPrivileged = anim.senderId === playerId || anim.targetId === playerId;
        const textToDisplay = isPrivileged ? anim.text : '🤫';
        const deltaX = anim.endX - anim.startX;
        const deltaY = anim.endY - anim.startY;

        return (
          <div
            key={anim.id}
            style={{
              position: 'absolute',
              left: anim.startX,
              top: anim.startY,
              transform: 'translate(-50%, -50%) scale(0.5)',
              opacity: 0,
              animation: 'whisperFly 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
              '--dx': `${deltaX}px`,
              '--dy': `${deltaY}px`,
            } as React.CSSProperties}
          >
            <div
              style={{
                background: 'var(--bg-card, #fff)',
                color: 'var(--text-primary, #000)',
                padding: '8px 14px',
                border: '2px solid var(--text-primary, #000)',
                boxShadow: '3px 3px 0 var(--text-primary, #000)',
                fontWeight: 700,
                fontSize: '13px',
                maxWidth: '180px',
                wordBreak: 'break-word',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                // Speech bubble tail
                position: 'relative',
              }}
            >
              💬 {textToDisplay}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes whisperFly {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.4);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          25% {
            transform: translate(-50%, -50%) scale(1);
          }
          80% {
            opacity: 1;
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.6);
          }
        }
      `}</style>
    </div>
  );
}
