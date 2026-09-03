import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

export function WhisperOverlay() {
  const { activeWhispers, playerId } = useGame();
  const [animations, setAnimations] = useState<any[]>([]);

  useEffect(() => {
    const newAnimations = activeWhispers.map(whisper => {
      const senderEl = document.getElementById(`player-${whisper.senderId}`) || document.getElementById(`avatar-${whisper.senderId}`);
      const targetEl = document.getElementById(`player-${whisper.targetId}`) || document.getElementById(`avatar-${whisper.targetId}`);
      
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight;
      let endX = window.innerWidth / 2;
      let endY = 0;

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

      return {
        ...whisper,
        startX,
        startY,
        endX,
        endY,
      };
    });
    setAnimations(newAnimations);
  }, [activeWhispers]);

  if (animations.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 999999 }}>
      {animations.map(anim => {
        const isPrivileged = anim.senderId === playerId || anim.targetId === playerId;
        const textToDisplay = isPrivileged ? anim.text : '...';

        return (
          <div
            key={anim.id}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translate(${anim.startX}px, ${anim.startY}px)`,
              animation: `flyToTarget_${anim.id} 3s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
            }}
          >
            <style>
              {`
                @keyframes flyToTarget_${anim.id} {
                  0% {
                    transform: translate(${anim.startX}px, ${anim.startY}px) scale(0.5);
                    opacity: 0;
                  }
                  10% {
                    transform: translate(${anim.startX}px, ${anim.startY}px) scale(1);
                    opacity: 1;
                  }
                  70% {
                    transform: translate(${anim.endX}px, ${anim.endY}px) scale(1);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(${anim.endX}px, ${anim.endY}px) scale(0.5);
                    opacity: 0;
                  }
                }
              `}
            </style>
            <div
              className="card"
              style={{
                transform: 'translate(-50%, -50%)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                padding: '8px 12px',
                borderRadius: '16px',
                border: '2px solid var(--border-main)',
                boxShadow: '4px 4px 0 var(--border-main)',
                fontWeight: 600,
                fontSize: '14px',
                maxWidth: '200px',
                wordBreak: 'break-word',
                textAlign: 'center',
              }}
            >
              {textToDisplay}
            </div>
          </div>
        );
      })}
    </div>
  );
}
