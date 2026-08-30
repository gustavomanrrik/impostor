import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getSavedPlayerName, getSavedAvatar, saveAvatar, savePlayerName, clearReconnectionData } from '../services/localStorage';
import { Difficulty, ImpostorMode } from '@shared/types';
import { AvatarSelector, getRandomAvatar } from '../components/AvatarSelector';

export function OnlineCreate() {
  const { navigate, createRoom, selectedGameType } = useGame();
  
  useEffect(() => {
    // Clear old reconnection data when entering this screen
    clearReconnectionData();
  }, []);
  
  const [playerName, setPlayerName] = useState(getSavedPlayerName());
  const [avatar, setAvatar] = useState(getSavedAvatar() || getRandomAvatar());
  
  const handleCreate = () => {
    if (!playerName.trim()) return;

    // A sala será criada com configurações padrão e depois o Host pode alterá-las no Lobby
    const config = {
      gameType: selectedGameType,
      theme: 'comida',
      difficulty: Difficulty.MEDIUM,
      impostorMode: ImpostorMode.AUTO,
      customImpostorCount: 1,
      discussionTimeLimit: 0,
      showImpostorCount: true,
      soundEnabled: true,
      useFlatMode: false,
    };

    savePlayerName(playerName.trim());
    saveAvatar(avatar);
    createRoom(playerName.trim(), avatar, config);
  };

  return (
    <div className="page page-centered fade-in" style={{ maxWidth: '500px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%', paddingBottom: '10vh' }}>
      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')} aria-label="Voltar">
        ← Voltar
      </button>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Criar Sala</h2>
        <p className="text-muted">A configuração da partida será feita dentro do Lobby!</p>
      </div>

      {/* Name and Avatar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="input-group">
          <label className="input-label">Seu Nome e Avatar</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AvatarSelector 
              selected={avatar} 
              onSelect={setAvatar} 
            />
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

      <button
        className="btn btn-primary"
        style={{ width: '100%', height: '56px', fontSize: '1.2rem', marginBottom: '16px' }}
        onClick={handleCreate}
        disabled={!playerName.trim()}
      >
        Criar e ir pro Lobby 🚀
      </button>

      <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
        Apenas você terá o poder de alterar o tema e iniciar a partida.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0 16px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        <span className="text-muted" style={{ fontSize: '0.9rem' }}>ou</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
      </div>

      <button
        className="btn btn-secondary"
        style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
        onClick={() => navigate('online-join')}
      >
        Entrar com código da sala →
      </button>
    </div>
  );
}
