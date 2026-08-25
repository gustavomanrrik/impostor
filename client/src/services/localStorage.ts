// ============================================
// IMPOSTOR GAME — localStorage Service
// ============================================
import type { GameHistoryEntry } from '@shared/types';

const PLAYER_NAME_KEY = 'impostor_player_name';
const AVATAR_KEY = 'impostor_avatar';

const KEYS = {
  PLAYED_GROUPS: 'impostor_playedGroups',
  HISTORY: 'impostor_history',
  SOUND_ENABLED: 'impostor_soundEnabled',
  ANIMATIONS_ENABLED: 'impostor_animationsEnabled',
  LAST_ROOM: 'impostor_lastRoom',
  LAST_PLAYER_ID: 'impostor_lastPlayerId',
};

// ─── Player Name & Avatar ───────────────────────

export function getSavedPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) || '';
}

export function savePlayerName(name: string): void {
  if (name.trim()) {
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
  }
}

export function getSavedAvatar(): string | null {
  return localStorage.getItem(AVATAR_KEY);
}

export function saveAvatar(avatar: string): void {
  if (avatar) {
    localStorage.setItem(AVATAR_KEY, avatar);
  }
}

// ─── Played Groups ───────────────────────

export function getPlayedGroups(): string[] {
  try {
    const data = localStorage.getItem(KEYS.PLAYED_GROUPS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addPlayedGroup(groupId: string): void {
  const groups = getPlayedGroups();
  if (!groups.includes(groupId)) {
    groups.push(groupId);
    localStorage.setItem(KEYS.PLAYED_GROUPS, JSON.stringify(groups));
  }
}

export function clearPlayedGroups(): void {
  localStorage.setItem(KEYS.PLAYED_GROUPS, JSON.stringify([]));
}

// ─── History ───────────────────────

export function getHistory(): GameHistoryEntry[] {
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: GameHistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  // Keep max 100 entries
  if (history.length > 100) {
    history.pop();
  }
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.setItem(KEYS.HISTORY, JSON.stringify([]));
}

// ─── Sound ───────────────────────

export function isSoundEnabled(): boolean {
  const val = localStorage.getItem(KEYS.SOUND_ENABLED);
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(KEYS.SOUND_ENABLED, String(enabled));
}

// ─── Animations ───────────────────────

export function isAnimationsEnabled(): boolean {
  const val = localStorage.getItem(KEYS.ANIMATIONS_ENABLED);
  return val === null ? true : val === 'true';
}

export function setAnimationsEnabled(enabled: boolean): void {
  localStorage.setItem(KEYS.ANIMATIONS_ENABLED, String(enabled));
}

// ─── Reconnection Data ───────────────────────

export function saveReconnectionData(roomCode: string, playerId: string): void {
  localStorage.setItem(KEYS.LAST_ROOM, roomCode);
  localStorage.setItem(KEYS.LAST_PLAYER_ID, playerId);
}

export function getReconnectionData(): { roomCode: string; playerId: string } | null {
  const roomCode = localStorage.getItem(KEYS.LAST_ROOM);
  const playerId = localStorage.getItem(KEYS.LAST_PLAYER_ID);
  if (roomCode && playerId) {
    return { roomCode, playerId };
  }
  return null;
}

export function clearReconnectionData(): void {
  localStorage.removeItem(KEYS.LAST_ROOM);
  localStorage.removeItem(KEYS.LAST_PLAYER_ID);
}
