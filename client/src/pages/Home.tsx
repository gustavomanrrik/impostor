import React from 'react';
import { useGame } from '../context/GameContext';
import { GameType } from '@shared/types';

export function Home() {
  const { navigate, selectedGameType, setSelectedGameType } = useGame();

  const handleSelectGame = (game: GameType) => {
    setSelectedGameType(game);
    navigate('online-create');
  };

  return (
    <div className="page page-centered fade-in" style={{ justifyContent: 'center', width: '100%', maxWidth: '800px' }}>


      {/* Slogan Area (Desktop Only) */}
      <div className="hide-on-mobile" style={{ textAlign: 'center', marginBottom: '32px', marginTop: '16px' }}>
        <p className="text-muted" style={{ fontSize: '1.2rem', fontWeight: 500, fontFamily: 'var(--font-display)' }}>
          a melhor coleção de jogos pra jogar com a galera
        </p>
      </div>

      {/* Games Grid */}
      <div className="home-games-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', width: '100%' }}>
        
        {/* Jogo 1: Impostor */}
        <div 
          className="card card-interactive home-game-card" 
          onClick={() => handleSelectGame(GameType.IMPOSTOR)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px', flex: '1 1 200px', maxWidth: '320px' }}
        >
          <div className="home-game-icon" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎭</div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>impostor</h2>
          <p className="text-muted" style={{ fontSize: '1rem' }}>descubra quem recebeu a palavra diferente.</p>
        </div>

        {/* Jogo 2: Jogo da Testa */}
        <div 
          className="card card-interactive home-game-card" 
          onClick={() => handleSelectGame(GameType.TESTA)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px', flex: '1 1 200px', maxWidth: '320px' }}
        >
          <div className="home-game-icon" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🗣️</div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>jogo da testa</h2>
          <p className="text-muted" style={{ fontSize: '1rem' }}>adivinhe a palavra que está na sua testa.</p>
        </div>

        {/* Jogo 3: Jogo dos Números */}
        <div 
          className="card card-interactive home-game-card" 
          onClick={() => handleSelectGame(GameType.NUMBERS)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px', flex: '1 1 200px', maxWidth: '320px' }}
        >
          <div className="home-game-icon" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔢</div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>jogo dos números</h2>
          <p className="text-muted" style={{ fontSize: '1rem' }}>descubra os números dos outros jogadores.</p>
        </div>

      </div>

      <div style={{ margin: '32px 0', width: '100%', height: '1px', background: 'var(--glass-border)' }}></div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('public-rooms')}
          style={{ padding: '12px 24px', fontSize: '1.1rem', width: '280px' }}
        >
          🌐 buscar salas públicas
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('online-join')}
          style={{ padding: '12px 24px', fontSize: '1.1rem', width: '280px' }}
          id="btn-join-room"
        >
          entrar com código da sala →
        </button>
      </div>

      <div className="spacer-8" />

      {/* Secondary Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
        <button className="btn btn-ghost" onClick={() => navigate('history')} id="btn-history" style={{ fontSize: '1.1rem' }}>
          📜 histórico
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('settings')} id="btn-settings" style={{ fontSize: '1.1rem' }}>
          ⚙️ configurações
        </button>
      </div>

      {/* Footer / Credits */}
      <div style={{ marginTop: 'auto', paddingTop: '32px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        criado por <a href="https://linkedin.com/in/gustavo-manrrik" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Gustavo Manrrik</a>
      </div>
    </div>
  );
}
