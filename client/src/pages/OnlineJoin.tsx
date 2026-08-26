import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getSavedPlayerName, getSavedAvatar, saveAvatar } from '../services/localStorage';
import { AvatarSelector, getRandomAvatar } from '../components/AvatarSelector';

export function OnlineJoin() {
  const { navigate, joinRoom } = useGame();
  const [playerName, setPlayerName] = useState(getSavedPlayerName());
  const [avatar, setAvatar] = useState(getSavedAvatar() || getRandomAvatar());
  const [roomCode, setRoomCode] = useState('');

  // Check URL for room code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setRoomCode(code.toUpperCase());
    }
  }, []);

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    saveAvatar(avatar);
    joinRoom(playerName.trim(), avatar, roomCode.trim());
  };

  return (
    <div className="page" style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')} aria-label="Voltar">
        ← Voltar
      </button>

      <h2 className="text-gradient">Entrar em Sala</h2>
      <p className="text-muted" style={{ marginTop: '4px' }}>Insira o código recebido</p>

      <div className="spacer-8" />

      <div className="card">
        <div className="input-group">
          <label className="input-label" htmlFor="join-name">Seu nome e Avatar</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AvatarSelector selected={avatar} onSelect={setAvatar} />
            <input
              id="join-name"
              className="input"
              type="text"
              placeholder="Digite seu nome..."
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={20}
              autoComplete="off"
              style={{ flex: 1, height: '48px' }}
            />
          </div>
        </div>

        <div className="spacer-4" />

        <div className="input-group">
          <label className="input-label" htmlFor="join-code">Código da sala</label>
          <input
            id="join-code"
            className="input input-code"
            type="text"
            placeholder="X7K92"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
            maxLength={5}
            autoComplete="off"
            autoCapitalize="characters"
          />
        </div>

        <div className="spacer-6" />

        <button
          className="btn btn-primary btn-xl"
          onClick={handleJoin}
          disabled={!playerName.trim() || roomCode.trim().length < 5}
          id="btn-join"
        >
          🚪 Entrar
        </button>
      </div>
    </div>
  );
}
