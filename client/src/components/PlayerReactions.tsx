import React from 'react';
import { useGame } from '../context/GameContext';

interface Props {
  playerId?: string;
  globalMode?: boolean;
}

// Gera uma posição horizontal consistente baseada no ID da reação
function hashToPercent(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100;
  }
  return 10 + (hash % 80); // entre 10% e 90%
}

export function PlayerReactions({ playerId, globalMode }: Props) {
  const { activeReactions } = useGame();
  
  const myReactions = globalMode 
    ? activeReactions 
    : activeReactions.filter(r => r.playerId === playerId);
  
  if (myReactions.length === 0) return null;

  if (globalMode) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999, 
        pointerEvents: 'none', 
      }}>
        {myReactions.map(r => {
          const isImage = r.reaction.startsWith('data:image/');
          const leftPct = hashToPercent(r.id);
          return (
            <div
              key={r.id}
              style={{
                position: 'absolute',
                bottom: '10%',
                left: `${leftPct}%`,
                animation: 'floatReaction 4s ease-out forwards',
                whiteSpace: 'nowrap',
              }}
            >
              {isImage ? (
                <img src={r.reaction} alt="Reaction" style={{ height: '2.5rem', width: '2.5rem', borderRadius: '8px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              ) : (
                <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{r.reaction}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: '50%', 
      transform: 'translateX(-50%)',
      zIndex: 99999, 
      pointerEvents: 'none', 
      display: 'flex', 
      justifyContent: 'center' 
    }}>
      {myReactions.map(r => {
        const isImage = r.reaction.startsWith('data:image/');
        return (
          <div
            key={r.id}
            style={{
              position: 'absolute',
              animation: 'floatReaction 4s ease-out forwards',
              whiteSpace: 'nowrap'
            }}
          >
            {isImage ? (
              <img src={r.reaction} alt="Reaction" style={{ maxHeight: '40px', maxWidth: '40px', borderRadius: '8px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            ) : (
              <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{r.reaction}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
