import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MoreVertical } from 'lucide-react';

export function RoomPrivacySettings() {
  const { roomState, playerId, updateConfig } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  if (!roomState) return null;

  const isHost = roomState.hostId === playerId || roomState.players.find(p => p.id === playerId)?.isHost === true;
  const { isPublic, password } = roomState.config;

  if (!isHost) {
    return <span className="badge" style={{ background: 'var(--bg-glass-strong)' }}>Apenas Host</span>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn btn-ghost btn-icon" 
        onClick={() => setIsOpen(!isOpen)}
        title="Configurações de Privacidade"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            className="card" 
            style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              width: '250px', 
              zIndex: 100, 
              padding: '16px',
              marginTop: '8px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h4 style={{ marginBottom: '12px' }}>Privacidade da Sala</h4>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button 
                className={`btn ${isPublic ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '4px 8px', fontSize: '0.85rem' }}
                onClick={() => updateConfig({ isPublic: true, password: '' })}
              >
                Pública
              </button>
              <button 
                className={`btn ${!isPublic ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '4px 8px', fontSize: '0.85rem' }}
                onClick={() => updateConfig({ isPublic: false })}
              >
                Privada
              </button>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label className="input-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Senha (Opcional)</label>
              <input 
                type="text" 
                className="input input-sm" 
                placeholder="Sem senha" 
                value={password || ''}
                onChange={e => updateConfig({ password: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
