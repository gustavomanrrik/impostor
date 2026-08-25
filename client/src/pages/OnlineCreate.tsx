import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getSavedPlayerName, getSavedAvatar, saveAvatar } from '../services/localStorage';
import { Difficulty, ImpostorMode } from '@shared/types';
import { AvatarSelector, getRandomAvatar } from '../components/AvatarSelector';

export function OnlineCreate() {
  const { themes, navigate, createRoom } = useGame();
  
  const [playerName, setPlayerName] = useState(getSavedPlayerName());
  const [avatar, setAvatar] = useState(getSavedAvatar() || getRandomAvatar());
  const [selectedTheme, setSelectedTheme] = useState('comida');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [impostorMode, setImpostorMode] = useState<ImpostorMode>(ImpostorMode.AUTO);
  const [customImpostorCount, setCustomImpostorCount] = useState(1);
  const [themeMode, setThemeMode] = useState<'ready' | 'collab' | 'solo'>('ready');
  const [useFlatMode, setUseFlatMode] = useState(false);
  
  // Solo Theme States
  const [soloWords, setSoloWords] = useState('');
  const [savedSoloThemes, setSavedSoloThemes] = useState<{name: string, words: string[]}[]>(() => {
    try {
      const stored = localStorage.getItem('impostor_solo_themes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveSoloTheme = () => {
    const list = soloWords.split(',').map(w => w.trim()).filter(w => w.length > 0);
    if (list.length < 4) {
      alert("Digite pelo menos 4 palavras separadas por vírgula para salvar o tema.");
      return;
    }
    const newThemes = [...savedSoloThemes, { name: `Meu Tema ${savedSoloThemes.length + 1}`, words: list }];
    setSavedSoloThemes(newThemes);
    localStorage.setItem('impostor_solo_themes', JSON.stringify(newThemes));
    setSoloWords('');
  };

  const handleCreate = () => {
    if (!playerName.trim()) return;

    const isCustom = themeMode !== 'ready';
    const config = {
      theme: isCustom ? 'custom' : selectedTheme,
      difficulty,
      impostorMode,
      customImpostorCount,
      discussionTimeLimit: 0,
      showImpostorCount: true,
      soundEnabled: true,
      useFlatMode: !isCustom && useFlatMode, // Só aplica se não for tema personalizado
    };

    saveAvatar(avatar);

    let customThemeObj = undefined;
    if (themeMode === 'solo') {
      // Create a temporary theme if there are typed words, otherwise use selected if available
      const list = soloWords.split(',').map(w => w.trim()).filter(w => w.length > 0);
      if (list.length >= 4) {
        customThemeObj = { name: 'Tema Solo', words: list };
      } else if (savedSoloThemes.length > 0) {
        // Fallback to the first saved solo theme if they didn't type new ones
        customThemeObj = savedSoloThemes[0];
      } else {
        alert("Digite pelo menos 4 palavras para jogar no modo solo (separadas por vírgula).");
        return;
      }
    }

    createRoom(playerName.trim(), avatar, config, customThemeObj);
  };

  return (
    <div className="page">
      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')} aria-label="Voltar">
        ← Voltar
      </button>

      <h2 className="text-gradient">Criar Sala</h2>
      <p className="text-muted" style={{ marginTop: '4px' }}>Configure e convide seus amigos</p>

      <div className="spacer-6" />

      {/* Player Name and Avatar */}
      <div className="input-group">
        <label className="input-label" htmlFor="create-name">Seu nome e Avatar</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <AvatarSelector selected={avatar} onSelect={setAvatar} />
          <input
            id="create-name"
            className="input"
            type="text"
            placeholder="Digite seu nome..."
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            maxLength={20}
            autoComplete="off"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="spacer-6" />

      {/* Theme Selection */}
      <div className="input-group">
        <label className="input-label">Tema</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${themeMode === 'ready' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setThemeMode('ready')}
          >
            Temas prontos
          </button>
          <button
            className={`btn btn-sm ${themeMode === 'collab' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setThemeMode('collab')}
          >
            Colaborativo (Lobby)
          </button>
          <button
            className={`btn btn-sm ${themeMode === 'solo' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setThemeMode('solo')}
          >
            Criar Sozinho
          </button>
        </div>

        {themeMode === 'ready' && (
          <div className="theme-grid">
            {themes.map(theme => (
              <div
                key={theme.id}
                className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => setSelectedTheme(theme.id)}
                role="radio"
                aria-checked={selectedTheme === theme.id}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelectedTheme(theme.id)}
              >
                <span className="theme-icon">{theme.icon}</span>
                <span className="theme-name">{theme.name}</span>
                <span className="theme-count">{theme.groupCount} grupos</span>
              </div>
            ))}
          </div>
        )}

        {themeMode === 'collab' && (
          <div className="flex flex-col gap-3" style={{ padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🤝</span>
            <p className="text-primary" style={{ fontWeight: 600 }}>Tema Colaborativo</p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Ao criar a sala, todos os jogadores poderão enviar palavras secretamente para formar o tema da rodada no Lobby!
            </p>
          </div>
        )}

        {themeMode === 'solo' && (
          <div style={{ padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
            <p className="text-primary" style={{ fontWeight: 600, marginBottom: '8px' }}>Seu Tema Personalizado</p>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
              Digite várias palavras separadas por vírgula. O jogo formará pares automaticamente!
            </p>
            
            <textarea
              className="input"
              rows={3}
              placeholder="Ex: Maçã, Banana, Laranja, Pera..."
              value={soloWords}
              onChange={e => setSoloWords(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
            
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ marginTop: '8px', width: '100%' }}
              onClick={saveSoloTheme}
              disabled={soloWords.split(',').filter(w=>w.trim().length>0).length < 4}
            >
              💾 Salvar para jogar depois
            </button>

            {savedSoloThemes.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Temas Salvos:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {savedSoloThemes.map((st, i) => (
                    <div key={i} className="badge" style={{ cursor: 'pointer', background: 'var(--bg-glass-strong)' }} onClick={() => setSoloWords(st.words.join(', '))}>
                      {st.name} ({st.words.length} pal.)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="spacer-6" />

      {/* Difficulty & Flat Mode */}
      {themeMode === 'ready' && (
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="input-label" style={{ margin: 0 }}>Modo de Jogo</label>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              className={`btn btn-sm ${!useFlatMode ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setUseFlatMode(false)}
              style={{ flex: 1 }}
            >
              🎭 Pares (Padrão)
            </button>
            <button
              className={`btn btn-sm ${useFlatMode ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setUseFlatMode(true)}
              style={{ flex: 1 }}
            >
              🔀 Palavras Soltas
            </button>
          </div>

          {!useFlatMode && (
            <div className="difficulty-selector">
          {[
            { value: Difficulty.EASY, label: '😊 Fácil' },
            { value: Difficulty.MEDIUM, label: '🤔 Médio' },
            { value: Difficulty.HARD, label: '😈 Difícil' },
          ].map(d => (
            <div
              key={d.value}
              className={`difficulty-option ${difficulty === d.value ? 'selected' : ''}`}
              onClick={() => setDifficulty(d.value)}
              role="radio"
              aria-checked={difficulty === d.value}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setDifficulty(d.value)}
            >
              {d.label}
            </div>
            ))}
            </div>
          )}
          
          {useFlatMode && (
            <div style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                O jogo irá ignorar a dificuldade e sorteará duas palavras aleatórias do tema inteiro. Nenhuma rodada será igual à outra!
              </p>
            </div>
          )}
        </div>
      )}

      <div className="spacer-6" />

      {/* Impostor Mode */}
      <div className="input-group">
        <label className="input-label">Impostores</label>
        <div className="difficulty-selector">
          <div
            className={`difficulty-option ${impostorMode === ImpostorMode.AUTO ? 'selected' : ''}`}
            onClick={() => setImpostorMode(ImpostorMode.AUTO)}
            role="radio"
            aria-checked={impostorMode === ImpostorMode.AUTO}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setImpostorMode(ImpostorMode.AUTO)}
          >
            🤖 Automático
          </div>
          <div
            className={`difficulty-option ${impostorMode === ImpostorMode.CUSTOM ? 'selected' : ''}`}
            onClick={() => setImpostorMode(ImpostorMode.CUSTOM)}
            role="radio"
            aria-checked={impostorMode === ImpostorMode.CUSTOM}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setImpostorMode(ImpostorMode.CUSTOM)}
          >
            ✏️ Personalizado
          </div>
        </div>

        {impostorMode === ImpostorMode.CUSTOM && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {[1, 2].map(n => (
              <div
                key={n}
                className={`difficulty-option ${customImpostorCount === n ? 'selected' : ''}`}
                onClick={() => setCustomImpostorCount(n)}
                style={{ flex: 1 }}
              >
                {n} impostor{n > 1 ? 'es' : ''}
              </div>
            ))}
          </div>
        )}

        {impostorMode === ImpostorMode.AUTO && (
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            3-4 jogadores: 1 impostor · 5-8 jogadores: 2 impostores
          </p>
        )}
      </div>

      <div className="spacer-8" />

      {/* Create Button */}
      <button
        className="btn btn-primary btn-xl"
        onClick={handleCreate}
        disabled={!playerName.trim()}
        id="btn-create-room"
      >
        🎮 Criar Sala
      </button>
    </div>
  );
}
