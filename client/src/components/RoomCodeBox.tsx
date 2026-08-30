import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export function RoomCodeBox() {
  const { roomState, playerId, updateConfig, addToast } = useGame();
  
  const isHost = roomState?.hostId === playerId || roomState?.players.find(p => p.id === playerId)?.isHost === true;
  
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Local state for settings form
  const [isPublic, setIsPublic] = useState(roomState?.config.isPublic || false);
  const [password, setPassword] = useState(roomState?.config.password || '');

  if (!roomState) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomState.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('success', 'Código copiado!');
    } catch (err) {
      addToast('error', 'Erro ao copiar código');
    }
  };

  const handleShare = async () => {
    const shareText = `Venha jogar comigo no mfp games! Código da sala: ${roomState.code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'mfp games',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyCode();
        }
      }
    } else {
      handleCopyCode();
    }
  };

  const saveSettings = () => {
    updateConfig({ isPublic, password: isPublic ? '' : password });
    setShowSettings(false);
    addToast('success', 'Visibilidade da sala atualizada!');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Room Code Main Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div className="room-code" aria-label={`Código da sala: ${roomState.code}`} style={{ fontSize: '1.5rem', padding: '4px 12px', margin: 0, flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
            {roomState.config.roomName || 'SALA'}
          </span>
          <span>{roomState.code}</span>
        </div>
        
        <button className="btn btn-secondary btn-sm" onClick={handleCopyCode} style={{ padding: '4px 12px' }} title="Copiar código">
          {copied ? '✅' : '📋'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleShare} style={{ padding: '4px 12px' }} title="Compartilhar">
          📤
        </button>
        
        {isHost && (
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => {
              setIsPublic(roomState.config.isPublic || false);
              setPassword(roomState.config.password || '');
              setShowSettings(!showSettings);
            }} 
            style={{ padding: '4px 12px', fontWeight: 'bold' }}
            title="Configurar visibilidade"
          >
            ⋮
          </button>
        )}
      </div>

      {/* Settings Dropdown/Modal */}
      {showSettings && isHost && (
        <div className="card fade-in" style={{ 
          position: 'absolute', 
          top: '60px', 
          right: 0, 
          zIndex: 100, 
          width: '280px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '2px solid var(--glass-border)', paddingBottom: '8px' }}>
            Visibilidade da Sala
          </h4>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isPublic} 
              onChange={(e) => setIsPublic(e.target.checked)} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--text-primary)' }}
            />
            <span style={{ fontWeight: 'bold' }}>Sala Pública</span>
          </label>
          
          <p className="text-muted" style={{ fontSize: '0.8rem', margin: '-4px 0 0 28px' }}>
            Salas públicas aparecem na lista para qualquer um entrar.
          </p>

          {!isPublic && (
            <div className="input-group" style={{ marginTop: '8px' }}>
              <label className="input-label" style={{ fontSize: '0.9rem' }}>Senha (opcional)</label>
              <input 
                type="text" 
                className="input" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Deixe em branco para sala aberta"
                style={{ fontSize: '0.9rem', padding: '6px 12px' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowSettings(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={saveSettings}>
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Password Display Row */}
      {!roomState.config.isPublic && roomState.config.password && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: showSettings ? '16px' : '-8px' }}>
          <div className="room-code" style={{ fontSize: '1.2rem', padding: '4px 12px', margin: 0, flex: 1, textAlign: 'center', background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Senha da Sala</span>
            {showPassword ? roomState.config.password : '••••••••'}
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
            onMouseLeave={() => setShowPassword(false)}
            onTouchStart={() => setShowPassword(true)}
            onTouchEnd={() => setShowPassword(false)}
            style={{ padding: '4px 12px', height: '100%' }}
            title="Mostrar senha"
          >
            👁️
          </button>
        </div>
      )}
    </div>
  );
}
