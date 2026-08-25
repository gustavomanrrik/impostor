import React from 'react';
import { useGame } from '../context/GameContext';

export function HowToPlay() {
  const { navigate } = useGame();

  return (
    <div className="page page-wide">
      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')} aria-label="Voltar">
        ← Voltar
      </button>

      <h2 className="text-gradient">Como Jogar</h2>

      <div className="spacer-6" />

      <div className="card" style={{ marginBottom: '12px' }}>
        <h3 style={{ marginBottom: '8px' }}>🎭 O que é o Impostor?</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          Impostor é um jogo de dedução social baseado em palavras. Todos recebem uma palavra parecida,
          mas um (ou mais) jogador recebe uma palavra <strong>diferente</strong> — esse é o impostor!
        </p>
      </div>

      <div className="card" style={{ marginBottom: '12px' }}>
        <h3 style={{ marginBottom: '8px' }}>📋 Exemplo</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          Tema: Relacionamentos<br />
          Palavra dos jogadores: <strong>namoro</strong><br />
          Palavra do impostor: <strong>casamento</strong><br /><br />
          As palavras são parecidas, então é preciso atenção para descobrir quem é diferente!
        </p>
      </div>

      <div className="card" style={{ marginBottom: '12px' }}>
        <h3 style={{ marginBottom: '8px' }}>🔄 Fases do Jogo</h3>
        <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <li><strong>Receber a palavra</strong> — cada jogador vê sua palavra em segredo.</li>
          <li><strong>Discussão</strong> — façam perguntas sem revelar sua palavra.</li>
          <li><strong>Votação</strong> — votem em quem acham que é o impostor.</li>
          <li><strong>Resultado</strong> — descubram se acertaram!</li>
        </ol>
      </div>

      <div className="card" style={{ marginBottom: '12px' }}>
        <h3 style={{ marginBottom: '8px' }}>🏆 Como Ganhar</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          <strong>Jogadores normais:</strong> Descubram quem é o impostor votando nele!<br />
          <strong>Impostor:</strong> Descubra qual é a palavra dos outros jogadores e não seja descoberto!
        </p>
      </div>

      <div className="card" style={{ marginBottom: '12px' }}>
        <h3 style={{ marginBottom: '8px' }}>💡 Dicas</h3>
        <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <li>Faça perguntas indiretas que revelem se a pessoa sabe a palavra.</li>
          <li>Se você é o impostor, preste atenção nas dicas dos outros.</li>
          <li>Não seja óbvio demais — pode denunciar que você é normal!</li>
          <li>Votação precisa de maioria. Empate = ninguém é eliminado.</li>
        </ul>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '8px' }}>👥 Modos de Jogo</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          <strong>🌐 Online:</strong> Cada jogador joga no seu próprio dispositivo. As palavras são distribuídas com segurança pelo servidor.<br /><br />
          <strong>📱 Local:</strong> Todos jogam no mesmo dispositivo, passando-o entre si para ver as palavras em segredo.
        </p>
      </div>
    </div>
  );
}
