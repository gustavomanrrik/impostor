import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';

export function KickPlayerButton({ playerId, playerName }: { playerId: string, playerName: string }) {
  const { roomState, playerId: myId, kickPlayer } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);
  
  if (roomState?.hostId !== myId || playerId === myId) return null;

  return (
    <>
      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
        <button 
          className="btn btn-ghost" 
          style={{ padding: '4px', fontSize: '1.2rem', lineHeight: 1, minWidth: 'auto', background: 'transparent' }}
          title="Expulsar jogador"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirm(true);
          }}
        >
          ⋮
        </button>
      </div>

      {showConfirm && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.7)', 
            zIndex: 99999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(false);
          }}
        >
          <div 
            className="card" 
            style={{ 
              background: 'var(--bg-primary)',
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'center',
              boxShadow: '8px 8px 0 #000'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#ff4444', textTransform: 'uppercase' }}>Expulsar Jogador?</h3>
            <p style={{ margin: 0, fontSize: '1.2rem' }}>Tem certeza que deseja expulsar <strong>{playerName}</strong> da sala?</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button 
                className="btn btn-ghost" 
                style={{ flex: 1, border: '3px solid var(--text-primary)' }}
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, background: '#ff4444', color: '#fff' }}
                onClick={() => {
                  kickPlayer(playerId);
                  setShowConfirm(false);
                }}
              >
                Sim, Expulsar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
