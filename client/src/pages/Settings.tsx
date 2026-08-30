import React from 'react';
import { useGame } from '../context/GameContext';
import {
  isSoundEnabled, setSoundEnabled,
  isAnimationsEnabled, setAnimationsEnabled,
  clearHistory, clearPlayedGroups, getSavedPlayerName, savePlayerName, getSavedAvatar, saveAvatar
} from '../services/localStorage';
import { setSoundsEnabled } from '../services/sounds';
import { AvatarSelector, getRandomAvatar } from '../components/AvatarSelector';

export function Settings() {
  const { navigate, addToast } = useGame();
  const [sound, setSound] = React.useState(isSoundEnabled());
  const [animations, setAnimations] = React.useState(isAnimationsEnabled());
  const [playerName, setPlayerName] = React.useState(getSavedPlayerName());
  const [avatar, setAvatar] = React.useState(getSavedAvatar() || getRandomAvatar());

  return (
    <div className="page" style={{ paddingTop: '48px', paddingBottom: '32px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button className="btn btn-ghost" onClick={() => navigate('home')} aria-label="Voltar" style={{ padding: '8px 16px', marginLeft: '-8px' }}>
            ← Voltar
          </button>
        </div>

        <h2 className="text-gradient text-center" style={{ marginBottom: '16px' }}>Configurações</h2>

        <div className="card">
          <div className="input-group">
            <label className="input-label" htmlFor="settings-name">Nome e Avatar padrão</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <AvatarSelector 
                selected={avatar} 
                onSelect={(val) => {
                  setAvatar(val);
                  saveAvatar(val);
                }} 
              />
              <input
                id="settings-name"
                className="input"
                value={playerName}
                onChange={e => {
                  setPlayerName(e.target.value);
                  savePlayerName(e.target.value);
                }}
                maxLength={20}
                placeholder="Seu nome..."
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <p style={{ fontWeight: 500 }}>🔊 Sons</p>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Efeitos sonoros do jogo</p>
            </div>
            <button
              className={`btn btn-sm ${sound ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                const newVal = !sound;
                setSound(newVal);
                setSoundEnabled(newVal);
                setSoundsEnabled(newVal);
              }}
            >
              {sound ? 'Ligado' : 'Desligado'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 500 }}>✨ Animações</p>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Animações e transições</p>
            </div>
            <button
              className={`btn btn-sm ${animations ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                const newVal = !animations;
                setAnimations(newVal);
                setAnimationsEnabled(newVal);
              }}
            >
              {animations ? 'Ligado' : 'Desligado'}
            </button>
          </div>
        </div>

        <div className="card">
          <p style={{ fontWeight: 500, marginBottom: '12px' }}>🗑️ Limpar dados</p>
          <div className="flex flex-col gap-3">
            <button
              className="btn btn-secondary w-full"
              onClick={() => {
                clearHistory();
                addToast('success', 'Histórico limpo!');
              }}
            >
              Limpar histórico de partidas
            </button>
            <button
              className="btn btn-secondary w-full"
              onClick={() => {
                clearPlayedGroups();
                addToast('success', 'Grupos resetados!');
              }}
            >
              Resetar grupos já jogados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
