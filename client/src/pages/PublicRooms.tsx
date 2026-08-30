import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getSavedPlayerName, getSavedAvatar, saveAvatar, savePlayerName, clearReconnectionData } from '../services/localStorage';
import { AvatarSelector, getRandomAvatar } from '../components/AvatarSelector';
import { GameType } from '@shared/types';

export function PublicRooms() {
  const { navigate, joinRoom, publicRooms, fetchPublicRooms } = useGame();
  const [playerName, setPlayerName] = useState(getSavedPlayerName());
  const [avatar, setAvatar] = useState(getSavedAvatar() || getRandomAvatar());
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    clearReconnectionData();
    fetchPublicRooms();
  }, [fetchPublicRooms]);

  const handleJoin = (code: string, requirePassword?: boolean) => {
    if (!playerName.trim()) {
      alert("Por favor, preencha seu nome primeiro!");
      return;
    }
    
    if (requirePassword) {
      setSelectedRoom(code);
      setPassword('');
    } else {
      savePlayerName(playerName.trim());
      saveAvatar(avatar);
      joinRoom(playerName.trim(), avatar, code);
    }
  };

  const handleConfirmPassword = () => {
    if (selectedRoom && password.trim()) {
      savePlayerName(playerName.trim());
      saveAvatar(avatar);
      joinRoom(playerName.trim(), avatar, selectedRoom, password.trim());
      setSelectedRoom(null);
    }
  };

  const gameTypeEmojis = {
    [GameType.IMPOSTOR]: '🎭 Impostor',
    [GameType.TESTA]: '🗣️ Testa',
    [GameType.NUMBERS]: '🔢 Números'
  };

  return (
    <div className="page fade-in" style={{ maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: '10vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
        <button className="btn btn-ghost back-btn" onClick={() => navigate('home')} aria-label="Voltar">
          ← Voltar
        </button>
        <button className="btn btn-ghost" onClick={() => fetchPublicRooms()} title="Atualizar">
          🔄 Atualizar
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Salas Públicas</h2>
      </div>

      <div className="card" style={{ marginBottom: '24px', maxWidth: '500px', width: '100%', margin: '0 auto 24px auto' }}>
        <div className="input-group">
          <label className="input-label">Seu Nome e Avatar (Obrigatório)</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AvatarSelector selected={avatar} onSelect={setAvatar} />
            <input
              className="input"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Digite seu nome..."
              maxLength={20}
              style={{ flex: 1, height: '48px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {publicRooms.length === 0 ? (
          <p className="text-muted text-center" style={{ gridColumn: '1 / -1' }}>Nenhuma sala pública ativa no momento.</p>
        ) : (
          publicRooms.map(room => (
            <div key={room.code} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }} onClick={() => handleJoin(room.code, room.hasPassword)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {room.hostName} {room.hasPassword && <span title="Protegida com senha">🔒</span>}
                  </h3>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                    {gameTypeEmojis[room.gameType]}
                  </p>
                </div>
                <div className="status-badge waiting" style={{ fontSize: '0.85rem' }}>
                  {room.playerCount}/{room.maxPlayers}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRoom && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} 
          onClick={() => setSelectedRoom(null)}
        >
          <div className="card fade-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px', border: '4px solid var(--text-primary)', background: 'var(--bg-primary)' }}>
            <h3 style={{ margin: 0 }}>Digite a Senha</h3>
            <input
              className="input"
              type="text"
              placeholder="Senha da sala"
              value={password}
              onChange={e => setPassword(e.target.value.trim())}
              maxLength={10}
              style={{ width: '100%', height: '48px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedRoom(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirmPassword} disabled={!password}>
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
