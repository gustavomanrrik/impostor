import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GameType } from '@shared/types';

export function Home() {
  const { navigate, selectedGameType, setSelectedGameType } = useGame();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (titleRef.current) {
        // Gera valores verdadeiramente aleatórios a cada ciclo
        const x = (Math.random() * 6 - 3).toFixed(1);
        const y = (Math.random() * 8 - 4).toFixed(1);
        const r = (Math.random() * 4 - 2).toFixed(1);
        titleRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
        titleRef.current.style.transition = 'transform 0.8s linear';
      }
    }, 750);

    return () => clearInterval(interval);
  }, []);

  const handleSelectGame = (game: GameType) => {
    setSelectedGameType(game);
    navigate('online-create');
  };

  return (
    <div className="page page-centered fade-in" style={{ justifyContent: 'center', width: '100%', maxWidth: '800px' }}>


      {/* Logo & Slogan Area (Desktop Only) */}
      <div className="hide-on-mobile" style={{ textAlign: 'center', marginBottom: '40px', marginTop: '16px' }}>
        <h1 ref={titleRef} style={{ display: 'inline-block', fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '0.05em', margin: '4px 0 8px 0', whiteSpace: 'nowrap' }}>
          mfp games
        </h1>
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
