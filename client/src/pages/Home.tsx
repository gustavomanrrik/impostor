import React from 'react';
import { useGame } from '../context/GameContext';

export function Home() {
  const { navigate } = useGame();

  return (
    <div className="page fade-in" style={{ justifyContent: 'center' }}>
      {/* Logo Area */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))' }} aria-hidden="true">
          🎭
        </div>
        <h1 className="text-gradient" style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)', fontWeight: 900, letterSpacing: '0.05em', margin: '8px 0' }}>
          IMPOSTOR
        </h1>
        <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
          Descubra quem recebeu a palavra diferente.
        </p>
      </div>

      {/* Main Action Card */}
      <div className="card card-glow" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* Online Section */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn btn-primary btn-xl"
            onClick={() => navigate('online-create')}
            aria-label="Jogar online"
            id="btn-online"
            style={{ width: '100%' }}
          >
            🌐 CRIAR SALA ONLINE
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate('online-join')}
            style={{ width: '100%', padding: '14px' }}
            id="btn-join-room"
          >
            Entrar com código →
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Jogue em dispositivos diferentes
          </span>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--glass-border-strong)', margin: '4px 0' }} />

        {/* Local Section */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-xl"
            onClick={() => navigate('local-setup')}
            aria-label="Jogar localmente"
            id="btn-local"
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.03)' }}
          >
            📱 JOGAR LOCAL
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Passem o celular entre si
          </span>
        </div>
      </div>

      <div className="spacer-8" />

      {/* Secondary Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
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
    </div>
  );
}
