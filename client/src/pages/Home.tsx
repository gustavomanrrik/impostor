import React from 'react';
import { useGame } from '../context/GameContext';

export function Home() {
  const { navigate } = useGame();

  return (
    <div className="page">
      {/* Logo */}
      <div style={{ marginBottom: '8px', fontSize: '4rem' }} aria-hidden="true">🎭</div>
      <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, letterSpacing: '0.08em' }}>
        IMPOSTOR
      </h1>
      <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '8px', textAlign: 'center' }}>
        Descubra quem recebeu a palavra diferente.
      </p>

      <div className="spacer-8" />

      <button
        className="btn btn-primary btn-xl"
        onClick={() => navigate('online-create')}
        aria-label="Jogar online"
        id="btn-online"
        style={{ width: '100%', maxWidth: '300px' }}
      >
        🌐 CRIAR SALA ONLINE
      </button>

      <button
        className="btn btn-ghost"
        onClick={() => navigate('online-join')}
        style={{ color: 'var(--accent-primary)', marginTop: '8px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'var(--bg-glass)', width: '100%', maxWidth: '300px', padding: '12px' }}
        id="btn-join-room"
      >
        Entrar com código →
      </button>
      
      <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '6px', marginBottom: '24px', textAlign: 'center' }}>
        Jogue com pessoas em dispositivos diferentes
      </p>

      <button
        className="btn btn-secondary btn-xl"
        onClick={() => navigate('local-setup')}
        aria-label="Jogar localmente"
        id="btn-local"
        style={{ width: '100%', maxWidth: '300px' }}
      >
        📱 JOGAR LOCAL
      </button>
      <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '6px', textAlign: 'center' }}>
        Passem o celular entre si
      </p>

      <div className="spacer-8" />

      {/* Secondary Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('how-to-play')} id="btn-how-to-play">
          📖 Como jogar
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('history')} id="btn-history">
          📜 Histórico
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('settings')} id="btn-settings">
          ⚙️ Configurações
        </button>
      </div>

      <div className="spacer-8" />

    </div>
  );
}
