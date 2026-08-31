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


      {/* Logo & Slogan Area */}
      <div style={{ textAlign: 'center', marginBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem, 8vw, 4rem)', textShadow: '4px 4px 0px rgba(0,0,0,0.2)', marginBottom: '8px', lineHeight: 1 }}>
          {'mfp games'.split('').map((char, index) => (
            <span key={index} style={{ display: 'inline-block', animation: `wave 1.5s infinite ${index * 0.1}s ease-in-out`, whiteSpace: 'pre' }}>
              {char}
            </span>
          ))}
        </h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', fontWeight: 500, fontFamily: 'var(--font-display)' }}>
          joguinhos clean pra quando nao tiver nada pra fazer
        </p>
      </div>

      {/* Games Grid */}
      <div className="home-games-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', width: '100%' }}>

        {/* Jogo 1: Impostor */}
        <div
          className="card card-interactive home-game-card"
          onClick={() => handleSelectGame(GameType.IMPOSTOR)}
        >
          <div className="home-game-header">
            <div className="home-game-icon">🎭</div>
            <h2>impostor</h2>
          </div>
          <p className="text-muted">descubra quem recebeu a palavra diferente.</p>
        </div>

        {/* Jogo 2: Jogo da Testa */}
        <div
          className="card card-interactive home-game-card"
          onClick={() => handleSelectGame(GameType.TESTA)}
        >
          <div className="home-game-header">
            <div className="home-game-icon">🗣️</div>
            <h2>jogo da testa</h2>
          </div>
          <p className="text-muted">adivinhe a palavra que está na sua testa.</p>
        </div>

        {/* Jogo 3: Jogo dos Números */}
        <div
          className="card card-interactive home-game-card"
          onClick={() => handleSelectGame(GameType.NUMBERS)}
        >
          <div className="home-game-header">
            <div className="home-game-icon">🔢</div>
            <h2>jogo dos números</h2>
          </div>
          <p className="text-muted">descubra os números dos outros jogadores.</p>
        </div>

      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px', marginBottom: '24px' }}>
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

      {/* Secondary Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
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
