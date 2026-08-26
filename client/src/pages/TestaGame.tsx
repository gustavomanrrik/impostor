import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { ReactionInput } from '../components/ReactionInput';

export function TestaGame() {
  const { roomState, playerId, nextRound, leaveRoom, addToast, guessTesta, giveUpTesta, themes } = useGame();
  const [guess, setGuess] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  if (!roomState) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = roomState.hostId === playerId;
  const currentTheme = themes.find(t => t.id === roomState.config.theme);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    guessTesta(guess.trim());
    setGuess('');
    addToast('info', 'Tentativa enviada!');
  };

  const handleGiveUp = () => {
    if (window.confirm('Tem certeza que deseja desistir? Você poderá ver sua palavra e aguardar os outros.')) {
      giveUpTesta();
    }
  };

  if (roomState.state === GameState.IN_GAME) {
    return (
      <div className="page" style={{ position: 'relative', overflowX: 'hidden' }}>
        <div className="status-badge voting" style={{ marginBottom: '12px', background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
          🧠 JOGO DA TESTA
        </div>

        <h2 className="text-center" style={{ fontSize: '2.5rem' }}>Quem sou eu?</h2>
        <p className="text-muted text-center" style={{ marginTop: '8px', fontSize: '1rem', marginBottom: '16px', maxWidth: '600px' }}>
          Faça perguntas de "sim" ou "não" para os outros jogadores e tente descobrir a palavra colada na sua testa!
        </p>

        <div className="status-badge" style={{ margin: '0 auto 24px', display: 'flex', width: 'fit-content', background: 'var(--bg-glass-strong)' }}>
          Tema: {roomState.config.theme === 'custom' ? 'Customizado' : `${currentTheme?.icon || ''} ${currentTheme?.name || roomState.config.theme}`}
        </div>

        {currentPlayer?.hasGuessedTesta ? (
          <div className="card text-center" style={{ marginBottom: '32px', border: '4px dashed var(--text-primary)' }}>
            <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>A palavra na sua testa era:</h3>
            <div style={{ 
              margin: '16px auto', 
              fontSize: '3rem', 
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              background: '#fff9c4', // Post-it yellow
              color: '#000',
              padding: '16px 32px',
              borderRadius: '2px 12px 2px 12px',
              boxShadow: '3px 3px 5px rgba(0,0,0,0.2)',
              display: 'inline-block',
              transform: 'rotate(-2deg)'
            }}>
              {currentPlayer.testaWord}
            </div>
            
            {roomState.config.testaMode === 'points' && currentPlayer.testaGuessedCorrectly && (
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Você acertou em {currentPlayer.testaGuessOrder}º lugar! 🏆
              </div>
            )}
            
            {roomState.config.testaMode === 'survival' && !currentPlayer.testaGuessedCorrectly && (
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Você foi eliminado! 💀
              </div>
            )}
            {roomState.config.testaMode === 'survival' && currentPlayer.testaGuessedCorrectly && (
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Você sobreviveu! 👑
              </div>
            )}
            
            <p className="text-muted" style={{ fontWeight: 'bold' }}>Aguardando os outros jogadores...</p>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: '32px', border: '4px solid var(--text-primary)' }}>
            {/* Vidas / Corações */}
            {roomState.config.testaLives && roomState.config.testaLives > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.5rem' }}>
                {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                  <span key={i} style={{ opacity: i < (currentPlayer?.testaLivesLeft || 0) ? 1 : 0.3, filter: i < (currentPlayer?.testaLivesLeft || 0) ? 'none' : 'grayscale(100%)' }}>❤️</span>
                ))}
              </div>
            ) : null}

            <form onSubmit={handleGuess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>O que está na minha testa?</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Ex: Neymar, Macaco..."
                  style={{ flex: 1, fontSize: '1.2rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>Chutar</button>
              </div>
            </form>
            <div className="spacer-3" />
            <button className="btn btn-ghost btn-sm w-full" onClick={handleGiveUp}>
              🏳️ Desistir e espiar a palavra
            </button>
          </div>
        )}

        <ReactionInput />

        {/* Nota Pessoal */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📝</span> Nota Pessoal (Só você vê)
          </h3>
          <textarea
            className="input"
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            placeholder="Anote aqui dicas, o que você já perguntou, etc..."
            style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
          />
        </div>

        <h3 style={{ marginBottom: '16px', fontSize: '1.5rem', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px', width: '100%' }}>Na testa da galera:</h3>
        <div className="player-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {roomState.players.filter(p => p.id !== playerId).map(p => (
            <div key={p.id} className="card" style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', 
              opacity: !p.isConnected ? 0.5 : 1,
              border: p.hasGuessedTesta ? '3px solid #ccc' : '3px solid var(--text-primary)',
              background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              position: 'relative'
            }}>
              
              <div style={{ position: 'relative', marginTop: '24px' }}>
                <AvatarDisplay avatar={p.avatar} size="5rem" />
                
                {/* Post-it simulado na testa do Avatar */}
                <div style={{ 
                  position: 'absolute',
                  top: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(5deg)',
                  background: p.hasGuessedTesta ? '#e0e0e0' : '#fff9c4',
                  color: p.hasGuessedTesta ? '#888' : '#000',
                  padding: '8px 12px', 
                  borderRadius: '2px 8px 2px 8px', 
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  whiteSpace: 'nowrap',
                  zIndex: 2,
                  minWidth: '80px',
                  textDecoration: p.hasGuessedTesta ? 'line-through' : 'none'
                }}>
                  {p.testaWord || '...'}
                </div>
              </div>

              <div style={{ flex: 1, textAlign: 'center', width: '100%' }}>
                <p style={{ fontWeight: 900, margin: 0, fontSize: '1.3rem', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>
                  {p.name}
                </p>
                {p.hasGuessedTesta && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {roomState.config.testaMode === 'survival' ? (
                      p.testaGuessedCorrectly ? 'Sobreviveu! 👑' : 'Eliminado 💀'
                    ) : (
                      p.testaGuessedCorrectly ? `${p.testaGuessOrder}º lugar 🏆` : 'Desistiu'
                    )}
                  </span>
                )}
                {roomState.config.testaLives && roomState.config.testaLives > 0 && !p.hasGuessedTesta ? (
                  <div style={{ marginTop: '8px', fontSize: '1.2rem' }}>
                    {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                      <span key={i} style={{ opacity: i < (p.testaLivesLeft || 0) ? 1 : 0.3, filter: i < (p.testaLivesLeft || 0) ? 'none' : 'grayscale(100%)' }}>❤️</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── RESULT PHASE ───────────────────────
  if (roomState.state === GameState.RESULT) {
    return (
      <div className="page fade-in text-center">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Fim de Jogo!</h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Todos adivinharam (ou desistiram).</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', width: '100%', alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: '1 1 300px', margin: 0 }}>
            <h2 style={{ marginBottom: '16px' }}>Palavras da Rodada:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              {roomState.players.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AvatarDisplay avatar={p.avatar} size="1.5rem" />
                    {p.name} {p.id === playerId && '(Você)'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>
                    {p.testaWord}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: '1 1 200px', margin: 0 }}>
            <h2 style={{ marginBottom: '16px' }}>🏆 Ranking</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {[...roomState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px dashed var(--border)', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                    {i + 1}. {p.name}
                  </span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isHost ? (
          <button className="btn btn-primary btn-xl w-full" onClick={nextRound}>
            🔄 Jogar Novamente
          </button>
        ) : (
          <div className="status-badge waiting">
            ⏳ Aguardando host iniciar nova rodada...
          </div>
        )}

        <div className="spacer-4" />
        <button className="btn btn-ghost btn-sm w-full" onClick={leaveRoom}>
          🚪 Sair da sala
        </button>
      </div>
    );
  }

  return null;
}
