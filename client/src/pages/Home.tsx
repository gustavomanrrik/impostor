import React from 'react';
import { useGame } from '../context/GameContext';
import { GameType } from '@shared/types';

export function Home() {
  const { navigate, setSelectedGameType } = useGame();

  const handleSelectGame = (game: GameType) => {
    setSelectedGameType(game);
    navigate('online-create');
  };

  return (
    <div className="page fade-in" style={{ justifyContent: 'center', width: '100%', maxWidth: '800px' }}>
      {/* Logo Area */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, letterSpacing: '0.05em', margin: '8px 0' }}>
          joguinhos bacanudos
        </h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', fontWeight: 500 }}>
          a melhor coleção de jogos pra jogar com a galera
        </p>
      </div>

      {/* Games Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
        
        {/* Jogo 1: Impostor */}
        <div 
          className="card card-interactive" 
          onClick={() => handleSelectGame(GameType.IMPOSTOR)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎭</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>impostor</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>descubra quem recebeu a palavra diferente.</p>
        </div>

        {/* Jogo 2: Jogo da Testa */}
        <div 
          className="card card-interactive" 
          onClick={() => handleSelectGame(GameType.TESTA)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗣️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>jogo da testa</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>adivinhe a palavra que está na sua testa.</p>
        </div>

        {/* Jogo 3: Jogo dos Números */}
        <div 
          className="card card-interactive" 
          onClick={() => handleSelectGame(GameType.NUMBERS)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔢</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>jogo dos números</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>descubra os números dos outros jogadores.</p>
        </div>

      </div>

      <div style={{ margin: '32px 0', width: '100%', height: '1px', background: 'var(--glass-border)' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('online-join')}
          style={{ padding: '14px 24px' }}
          id="btn-join-room"
        >
          entrar com código da sala →
        </button>
      </div>

      <div className="spacer-8" />

      {/* Secondary Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('history')} id="btn-history">
          📜 histórico
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('settings')} id="btn-settings">
          ⚙️ configurações
        </button>
      </div>

      {/* Footer / Credits */}
      <div style={{ marginTop: '120px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        criado por <a href="https://linkedin.com/in/gustavo-manrrik" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Gustavo Manrrik</a>
      </div>
    </div>
  );
}
