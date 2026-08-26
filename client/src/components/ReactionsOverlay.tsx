import React from 'react';
import { useGame } from '../context/GameContext';
import { AvatarDisplay } from './AvatarDisplay';

export function ReactionsOverlay() {
  const { roomState, activeReactions, playerId } = useGame();

  if (!roomState) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {activeReactions.map(r => {
        const isMe = r.playerId === playerId;
        const player = roomState.players.find(p => p.id === r.playerId);
        const isImage = r.reaction.startsWith('data:image/');
        return (
          <div
            key={r.id}
            style={{
              position: 'absolute',
              top: `${r.top}%`,
              left: isMe ? 'auto' : '10px',
              right: isMe ? '10px' : 'auto',
              animation: 'floatUp 4s ease-out forwards',
            }}
            className="reaction-bubble"
          >
            <div className="avatar" style={{ display: 'flex', alignItems: 'center' }}>
              <AvatarDisplay avatar={player?.avatar || ''} size="1.5rem" />
            </div>
            {isImage ? (
              <img src={r.reaction} alt="Reaction" style={{ maxHeight: '100px', maxWidth: '100px', borderRadius: '8px', objectFit: 'contain' }} />
            ) : (
              <span className="text">{r.reaction}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
