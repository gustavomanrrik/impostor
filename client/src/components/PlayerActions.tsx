import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { VolumeX, Volume2, MessageCircle, MoreVertical } from 'lucide-react';
import { KickPlayerButton } from './KickPlayerButton';

interface PlayerActionsProps {
  playerId: string;
  playerName: string;
}

export function PlayerActions({ playerId, playerName }: PlayerActionsProps) {
  const { mutedPlayers, toggleMutePlayer, sendWhisper, playerId: myId, roomState } = useGame();
  const [isWhispering, setIsWhispering] = useState(false);
  const [whisperText, setWhisperText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setIsWhispering(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (playerId === myId) return null;

  const isMuted = mutedPlayers.includes(playerId);
  const isHost = roomState?.hostId === myId;

  const handleWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperText.trim()) return;
    sendWhisper(playerId, whisperText.trim());
    setWhisperText('');
    setIsWhispering(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        type="button"
        className="btn btn-ghost btn-sm btn-icon"
        style={{ padding: '4px' }}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
          setIsWhispering(false);
        }}
        title="Opções"
      >
        <MoreVertical size={20} strokeWidth={2.5} />
      </button>

      {menuOpen && (
        <div style={{ 
          position: 'absolute', 
          right: 0, 
          top: '100%', 
          zIndex: 100, 
          background: 'var(--bg-primary)', 
          border: '2px solid var(--text-primary)', 
          borderRadius: '8px', 
          padding: '8px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          minWidth: '150px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {isWhispering ? (
            <form onSubmit={handleWhisper} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Enviar</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsWhispering(false)}>Cancelar</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {isHost && <KickPlayerButton playerId={playerId} playerName={playerName} />}
              
              <button 
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWhispering(true);
                }}
              >
                <MessageCircle size={16} strokeWidth={2.5} /> Sussurrar
              </button>
              
              <button 
                type="button"
                className={`btn ${isMuted ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                style={{ 
                  display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px',
                  background: isMuted ? 'var(--error)' : 'transparent', 
                  color: isMuted ? 'white' : 'var(--text-primary)', 
                  border: isMuted ? '2px solid black' : 'none' 
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMutePlayer(playerId);
                }}
              >
                {isMuted ? <VolumeX size={16} strokeWidth={2.5} /> : <Volume2 size={16} strokeWidth={2.5} />}
                {isMuted ? 'Desmutar' : 'Mutar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

