// ============================================
// IMPOSTOR GAME — Game Context
// ============================================
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../services/socket';
import {
  saveReconnectionData, clearReconnectionData, getReconnectionData,
  addPlayedGroup, addHistoryEntry, savePlayerName,
} from '../services/localStorage';
import { playJoinSound, playStartSound, playVotingStartedSound, playSuspenseSound, playWinSound, playLoseSound, playVoteSound } from '../services/sounds';
import type { RoomPublicState, GameResult, ThemeListItem, GameHistoryEntry } from '@shared/types';

// ─── Types ───────────────────────
export type Page =
  | 'home'
  | 'online-create'
  | 'online-join'
  | 'lobby'
  | 'game'
  | 'local-setup'
  | 'local-game'
  | 'how-to-play'
  | 'settings'
  | 'history';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface GameContextType {
  // Navigation
  page: Page;
  navigate: (page: Page) => void;

  // Online state
  roomState: RoomPublicState | null;
  playerId: string | null;
  myWord: string | null;
  isImpostor: boolean;
  gameResult: GameResult | null;
  isConnected: boolean;
  themes: ThemeListItem[];

  // Actions
  createRoom: (playerName: string, avatar: string, config: any, customTheme?: any) => void;
  joinRoom: (playerName: string, avatar: string, roomCode: string) => void;
  leaveRoom: () => void;
  updateConfig: (updates: any) => void;
  setCustomTheme: (theme: any) => void;
  startGame: () => void;
  markWordSeen: () => void;
  requestVote: () => void;
  submitVote: (votedForId: string) => void;
  voteSkip: () => void;
  nextRound: () => void;
  changeTheme: () => void;
  sendReaction: (reaction: string) => void;
  resetScores: () => void;
  activeReactions: { id: string; playerId: string; reaction: string; top: number }[];
  
  // Custom Theme Collaboration
  customThemeWords: string[];
  addCustomWord: (word: string) => void;
  removeCustomWord: (word: string) => void;

  // Local mode state
  localState: LocalGameState | null;
  setLocalState: (state: LocalGameState | null) => void;

  // UI
  toasts: ToastItem[];
  addToast: (type: ToastItem['type'], message: string) => void;
  showSuspense: boolean;
}

export interface LocalGameState {
  phase: 'setup' | 'word-reveal' | 'discussion' | 'voting' | 'result';
  players: LocalPlayer[];
  currentPlayerIndex: number;
  config: {
    theme: string;
    difficulty: string;
    impostorCount: number;
    themeName: string;
  };
  normalWord: string;
  impostorWord: string;
  groupId: string;
  votes: Map<string, string>;
  result: GameResult | null;
}

export interface LocalPlayer {
  id: string;
  name: string;
  isImpostor: boolean;
  word: string;
  hasSeenWord: boolean;
  hasVoted: boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<Page>('home');
  const [roomState, setRoomState] = useState<RoomPublicState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [myWord, setMyWord] = useState<string | null>(null);
  const [isImpostor, setIsImpostor] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [localState, setLocalState] = useState<LocalGameState | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showSuspense, setShowSuspense] = useState(false);
  const [customThemeWords, setCustomThemeWords] = useState<string[]>([]);
  const [activeReactions, setActiveReactions] = useState<{ id: string; playerId: string; reaction: string; top: number }[]>([]);
  const hasSetupListeners = useRef(false);

  // ─── Toast ───────────────────────
  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // ─── Navigate ───────────────────────
  const navigate = useCallback((newPage: Page) => {
    setPage(newPage);
    if (newPage === 'home') {
      setRoomState(null);
      setPlayerId(null);
      setMyWord(null);
      setIsImpostor(false);
      setGameResult(null);
      setLocalState(null);
    }
  }, []);

  // ─── Fetch Themes ───────────────────────
  useEffect(() => {
    fetch('/api/themes')
      .then(r => r.json())
      .then(setThemes)
      .catch(() => {
        // Fallback themes
        setThemes([
          { id: 'relacionamentos', name: 'Relacionamentos', icon: '💕', groupCount: 25 },
          { id: 'comida', name: 'Comida e Bebida', icon: '🍕', groupCount: 30 },
          { id: 'lugares', name: 'Lugares', icon: '📍', groupCount: 25 },
          { id: 'trabalho', name: 'Trabalho e Carreira', icon: '💼', groupCount: 20 },
          { id: 'tecnologia', name: 'Tecnologia', icon: '📱', groupCount: 25 },
          { id: 'esportes', name: 'Esportes e Fitness', icon: '⚽', groupCount: 20 },
          { id: 'entretenimento', name: 'Entretenimento', icon: '🎬', groupCount: 25 },
          { id: 'viagens', name: 'Viagens', icon: '✈️', groupCount: 20 },
          { id: 'educacao', name: 'Educação', icon: '📚', groupCount: 20 },
          { id: 'cotidiano', name: 'Vida Cotidiana', icon: '🏠', groupCount: 20 },
          { id: 'emocoes', name: 'Emoções e Sentimentos', icon: '🎭', groupCount: 20 },
          { id: 'festas', name: 'Festas e Eventos', icon: '🎉', groupCount: 20 },
          { id: 'financas', name: 'Dinheiro e Finanças', icon: '💰', groupCount: 15 },
          { id: 'saude', name: 'Saúde e Bem-estar', icon: '🏥', groupCount: 15 },
          { id: 'moda', name: 'Moda e Estilo', icon: '👗', groupCount: 15 },
          { id: 'natureza', name: 'Natureza e Clima', icon: '🌿', groupCount: 15 },
          { id: 'familia', name: 'Família', icon: '👨‍👩‍👧‍👦', groupCount: 15 },
          { id: 'conceitos', name: 'Conceitos e Ideias', icon: '💡', groupCount: 20 },
        ]);
      });
  }, []);

  // ─── Socket Setup ───────────────────────
  useEffect(() => {
    if (hasSetupListeners.current) return;
    hasSetupListeners.current = true;

    const socket = getSocket();

    socket.on('connect', () => {
      setIsConnected(true);
      // Try reconnection
      const data = getReconnectionData();
      if (data && page !== 'home') {
        socket.emit('room:reconnect', data);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('error', (data) => {
      addToast('error', data.message);
    });

    socket.on('room:created', (data) => {
      setPlayerId(data.playerId);
      saveReconnectionData(data.roomCode, data.playerId);
    });

    socket.on('room:joined', (data) => {
      setPlayerId(data.playerId);
      setRoomState(data.roomState);
      saveReconnectionData(data.roomState.code, data.playerId);
      setPage('lobby');
    });

    socket.on('room:updated', (state) => {
      setRoomState(state);
    });

    socket.on('room:playerJoined', () => {
      playJoinSound();
    });

    socket.on('room:hostChanged', () => {
      addToast('info', 'O host da sala mudou.');
    });

    socket.on('room:closed', () => {
      addToast('warning', 'A sala foi encerrada.');
      clearReconnectionData();
      setPage('home');
    });

    socket.on('game:started', (state) => {
      setRoomState(state);
      setGameResult(null);
      setPage('game');
      playStartSound();
    });

    socket.on('game:yourWord', (data) => {
      setMyWord(data.word);
      setIsImpostor(data.isImpostor);
    });

    socket.on('game:discussionStarted', () => {
      // state already updated via room:updated
    });

    socket.on('game:voteRequested', () => {
      // state already updated via room:updated
    });

    socket.on('game:votingStarted', () => {
      playVotingStartedSound();
      addToast('info', 'A votação começou!');
    });

    socket.on('game:voteRegistered', () => {
      playVoteSound();
    });

    socket.on('game:result', (result) => {
      setShowSuspense(true);
      playSuspenseSound();
      setTimeout(() => {
        setShowSuspense(false);
        setGameResult(result);
        // Save to history
        const historyEntry: GameHistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          theme: result.themeName,
          normalWord: result.normalWord,
          impostorWord: result.impostorWord,
          playerCount: roomState?.totalPlayers || 0,
          wasImpostor: isImpostor,
          won: isImpostor ? !result.impostorsFound : result.impostorsFound,
          groupId: '',
        };
        addHistoryEntry(historyEntry);
        if (result.impostorsFound && !isImpostor) {
          playWinSound();
        } else if (!result.impostorsFound && isImpostor) {
          playWinSound();
        } else {
          playLoseSound();
        }
      }, 3500);
    });

    socket.on('game:roundReset', (state) => {
      setRoomState(state);
      setMyWord(null);
      setIsImpostor(false);
      setGameResult(null);
      setPage('lobby');
    });

    socket.on('theme:sync', (words) => {
      setCustomThemeWords(words);
    });

    socket.on('room:reconnected', (data) => {
      setPlayerId(data.playerId);
      setRoomState(data.roomState);
      if (data.word) {
        setMyWord(data.word);
        setIsImpostor(data.isImpostor || false);
      }
      if (data.roomState.state === 'LOBBY') {
        setPage('lobby');
      } else {
        setPage('game');
      }
      addToast('success', 'Reconectado com sucesso!');
    });

    socket.on('game:reactionReceived', (data) => {
      const reactionId = Math.random().toString(36).substring(2, 9);
      const randomTop = Math.random() * 40 + 20; // fixed initial top position
      setActiveReactions(prev => [...prev, { id: reactionId, playerId: data.playerId, reaction: data.reaction, top: randomTop }]);
      setTimeout(() => {
        setActiveReactions(prev => prev.filter(r => r.id !== reactionId));
      }, 4000);
    });

    return () => {
      // Don't remove listeners on cleanup since we use ref guard
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Actions ───────────────────────
  const createRoom = useCallback((playerName: string, avatar: string, config: any, customTheme?: any) => {
    connectSocket();
    savePlayerName(playerName);
    const socket = getSocket();
    socket.emit('room:create', { playerName, avatar, config, customTheme });
  }, []);

  const joinRoom = useCallback((playerName: string, avatar: string, roomCode: string) => {
    connectSocket();
    savePlayerName(playerName);
    const socket = getSocket();
    socket.emit('room:join', { playerName, avatar, roomCode });
  }, []);

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    socket.emit('room:leave');
    clearReconnectionData();
    disconnectSocket();
    setRoomState(null);
    setPlayerId(null);
    setMyWord(null);
    setIsImpostor(false);
    setGameResult(null);
    setPage('home');
  }, []);

  const updateConfig = useCallback((updates: any) => {
    getSocket().emit('room:updateConfig', updates);
  }, []);

  const addCustomWord = useCallback((word: string) => {
    getSocket().emit('theme:addWord', word);
  }, []);

  const removeCustomWord = useCallback((word: string) => {
    getSocket().emit('theme:removeWord', word);
  }, []);

  const startGame = useCallback(() => {
    getSocket().emit('game:start');
  }, []);

  const markWordSeen = useCallback(() => {
    getSocket().emit('game:wordSeen');
  }, []);

  const requestVote = useCallback(() => {
    getSocket().emit('game:requestVote');
  }, []);

  const submitVote = useCallback((votedForId: string) => {
    getSocket().emit('game:vote', votedForId);
  }, []);

  const voteSkip = useCallback(() => {
    getSocket().emit('game:voteSkip');
  }, []);

  const nextRound = useCallback(() => {
    getSocket().emit('game:nextRound');
  }, []);

  const changeTheme = useCallback(() => {
    getSocket().emit('game:changeTheme');
  }, []);

  const resetScores = useCallback(() => {
    getSocket().emit('room:resetScores');
  }, []);

  const sendReaction = useCallback((reaction: string) => {
    getSocket().emit('game:reaction', reaction);
  }, []);

  const value: GameContextType = {
    page, navigate,
    roomState, playerId, myWord, isImpostor, gameResult, isConnected, themes,
    createRoom, joinRoom, leaveRoom, updateConfig, setCustomTheme: () => {}, // mock for backward compat
    startGame, markWordSeen, requestVote, submitVote, voteSkip, nextRound, changeTheme,
    sendReaction, resetScores, activeReactions,
    localState, setLocalState,
    toasts, addToast, showSuspense,
    customThemeWords, addCustomWord, removeCustomWord,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
