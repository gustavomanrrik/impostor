import React from 'react';
import { useGame } from '../context/GameContext';
import { getHistory, clearHistory } from '../services/localStorage';

export function History() {
  const { navigate, addToast } = useGame();
  const [history, setHistoryState] = React.useState(getHistory());

  const handleClear = () => {
    clearHistory();
    setHistoryState([]);
    addToast('success', 'Histórico limpo!');
  };

  return (
    <div className="page page-wide">
      

      <h2 className="text-gradient">Histórico</h2>

      <div className="spacer-6" />

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📜</p>
          <p className="text-muted">Nenhuma partida ainda.</p>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Jogue uma partida para ver o histórico aqui!
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {history.map(entry => {
              const date = new Date(entry.date);
              const dateStr = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={entry.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.theme}</span>
                    <span className={`status-badge ${entry.won ? 'ready' : 'waiting'}`}>
                      {entry.won ? '🏆 Vitória' : '💀 Derrota'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                    <div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Normal</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--success)' }}>{entry.normalWord}</p>
                    </div>
                    <div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Impostor</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--danger)' }}>{entry.impostorWord}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>👥 {entry.playerCount} jogadores</span>
                    <span>{dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="spacer-6" />

          <button className="btn btn-ghost" onClick={handleClear}>
            🗑️ Limpar histórico
          </button>
        </>
      )}
    </div>
  );
}

