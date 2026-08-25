import React, { useState } from 'react';

interface ThemeBuilderModalProps {
  onClose: () => void;
  words: string[];
  onRemoveWord: (word: string) => void;
}

export function ThemeBuilderModal({ onClose, words, onRemoveWord }: ThemeBuilderModalProps) {
  const [showWords, setShowWords] = useState(false);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Tema Colaborativo</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p className="text-muted" style={{ margin: 0 }}>
            {words.length} palavra{words.length !== 1 ? 's' : ''} no banco
          </p>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setShowWords(!showWords)}
          >
            {showWords ? '👁️ Esconder' : '🙈 Revelar'}
          </button>
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
          {words.length === 0 ? (
            <p className="text-muted text-center" style={{ padding: '24px 0' }}>Nenhuma palavra adicionada ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {words.map((word, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-glass)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ filter: showWords ? 'none' : 'blur(4px)', transition: 'filter 0.3s' }}>
                    {word}
                  </span>
                  <button 
                    className="btn btn-ghost" 
                    style={{ padding: '4px 8px', color: 'var(--danger)' }}
                    onClick={() => onRemoveWord(word)}
                    title="Remover palavra"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
