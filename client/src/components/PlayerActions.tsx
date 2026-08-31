import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface PlayerActionsProps {
  playerId: string;
  playerName: string;
}

export function PlayerActions({ playerId, playerName }: PlayerActionsProps) {
  const { roomState, playerId: myId, kickPlayer, mutedPlayers, toggleMutePlayer, sendWhisper } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [isWhispering, setIsWhispering] = useState(false);
  const [whisperText, setWhisperText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isHost = roomState?.hostId === myId;
  const isMuted = mutedPlayers.includes(playerId);
  
  if (playerId === myId) return null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsWhispering(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperText.trim()) return;
    sendWhisper(playerId, whisperText.trim());
    setWhisperText('');
    setIsWhispering(false);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px' }}>
      {isMuted && <span title="Silenciado" style={{ fontSize: '1.2rem', filter: 'drop-shadow(1px 1px 0px #000)' }}>🔇</span>}
      <button 
        className="btn btn-ghost" 
        style={{ padding: '0 4px', fontSize: '1.2rem', lineHeight: 1, minWidth: 'auto', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '4px' }}
        title="Opções"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
          setIsWhispering(false);
        }}
      >
        ⋮
      </button>

      {isOpen && (
        <div 
          className="card fade-in"
          style={{ 
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '4px',
            background: 'var(--bg-primary)',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: isWhispering ? '200px' : '120px',
            boxShadow: 'var(--shadow-md)',
            border: '2px solid var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
            zIndex: 100
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isWhispering ? (
            <form onSubmit={handleWhisper} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px' }}>
              <input 
                type="text" 
                autoFocus 
                className="input" 
                style={{ padding: '4px 8px', fontSize: '0.9rem', width: '100%' }}
                placeholder={`Para ${playerName}...`}
                value={whisperText}
                onChange={e => setWhisperText(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '2px' }}>Enviar</button>
                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '2px' }} onClick={() => setIsWhispering(false)}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              {isHost && (
                <button 
                  className="btn btn-ghost btn-sm" 
                  style={{ color: 'var(--error)', justifyContent: 'flex-start', padding: '4px 8px', fontSize: '0.85rem' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    kickPlayer(playerId);
                    setIsOpen(false);
                  }}
                >
                  👞 Expulsar
                </button>
              )}
              
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ justifyContent: 'flex-start', padding: '4px 8px', fontSize: '0.85rem' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsWhispering(true);
                }}
              >
                💬 Sussurrar
              </button>
              
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ justifyContent: 'flex-start', padding: '4px 8px', fontSize: '0.85rem' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMutePlayer(playerId);
                  setIsOpen(false);
                }}
              >
                {isMuted ? '🔊 Desmutar' : '🔇 Silenciar'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
