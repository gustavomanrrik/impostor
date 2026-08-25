// ============================================
// IMPOSTOR GAME — Tipos Compartilhados
// ============================================

// Estados da máquina de estados do jogo
export enum GameState {
  LOBBY = 'LOBBY',
  STARTING = 'STARTING',
  WORD_REVEAL = 'WORD_REVEAL',
  DISCUSSION = 'DISCUSSION',
  VOTING_REQUEST = 'VOTING_REQUEST',
  VOTING = 'VOTING',
  REVEALING = 'REVEALING',
  RESULT = 'RESULT',
}

// Dificuldade do jogo
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

// Modo de impostores
export enum ImpostorMode {
  AUTO = 'AUTO',
  CUSTOM = 'CUSTOM',
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

// Jogador
export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isConnected: boolean;
  isImpostor?: boolean; // Só visível no resultado
  word?: string; // Cada jogador só recebe a própria
  hasSeenWord?: boolean;
  hasVoted?: boolean;
  hasRequestedVote?: boolean;
  votedFor?: string; // ID do jogador votado
  hasVotedSkip?: boolean;
  score: number;
  isWinner?: boolean;
}

// Configuração da sala
export interface RoomConfig {
  theme: string;
  customThemeId?: string;
  difficulty: Difficulty;
  impostorMode: ImpostorMode;
  customImpostorCount: number;
  discussionTimeLimit: number; // 0 = sem limite, em segundos
  showImpostorCount: boolean;
  soundEnabled: boolean;
  useFlatMode?: boolean; // Modo Palavras Soltas
}

// Grupo de pares por dificuldade
export interface ThemePairs {
  easy: [string, string][];
  medium: [string, string][];
  hard: [string, string][];
}

// Tema
export interface Theme {
  id: string;
  name: string;
  icon: string;
  is18Plus?: boolean;
  pairs: ThemePairs;
}

// Tema personalizado
export interface CustomTheme {
  id: string;
  name: string;
  words: string[];
}

// Resultado da seleção de palavras
export interface WordSelection {
  groupId: string;
  normalWord: string;
  impostorWord: string;
  themeName: string;
}

// Voto
export interface Vote {
  voterId: string;
  votedForId: string;
}

// Resultado da votação
export interface VoteResult {
  playerId: string;
  playerName: string;
  voteCount: number;
}

// Resultado da partida
export interface GameResult {
  impostorsFound: boolean;
  impostors: { id: string; name: string }[];
  normalWord: string;
  impostorWord: string;
  themeName: string;
  votes: VoteResult[];
  eliminatedPlayer: { id: string; name: string } | null;
  impostorsDiscovered: number;
  totalImpostors: number;
}

// Estado público da sala (enviado para os jogadores)
export interface RoomPublicState {
  code: string;
  state: GameState;
  players: PublicPlayer[];
  config: RoomConfig;
  hostId: string;
  voteRequestCount: number;
  voteRequestsNeeded: number;
  votesRegistered: number;
  totalPlayers: number;
  round: number;
  customThemeWordCount: number; // Nova propriedade para o lobby
}

// Jogador público (sem informações secretas)
export interface PublicPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isConnected: boolean;
  hasSeenWord: boolean;
  hasVoted: boolean;
  hasRequestedVote: boolean;
  hasVotedSkip?: boolean;
  score: number;
  isWinner?: boolean;
}

// Histórico de partida (localStorage)
export interface GameHistoryEntry {
  id: string;
  date: string;
  theme: string;
  normalWord: string;
  impostorWord: string;
  playerCount: number;
  wasImpostor: boolean;
  won: boolean;
  groupId: string;
}

// ============================================
// EVENTOS SOCKET.IO
// ============================================

// Eventos do Client → Server
export interface ClientToServerEvents {
  // Lobby
  'room:create': (data: { playerName: string; avatar: string; config: RoomConfig; customTheme?: CustomTheme }) => void;
  'room:join': (data: { playerName: string; avatar: string; roomCode: string }) => void;
  'room:leave': () => void;
  'room:updateConfig': (config: Partial<RoomConfig>) => void;
  'room:kick': (playerId: string) => void;

  // Game
  'game:start': () => void;
  'game:wordSeen': () => void;
  'game:requestVote': () => void;
  'game:cancelVoteRequest': () => void;
  'game:vote': (votedForId: string) => void;
  'game:voteSkip': () => void; // Pular rodada
  'game:nextRound': () => void;
  'game:changeTheme': () => void;
  'game:reaction': (reaction: string) => void;

  // Custom Theme
  'theme:setCustom': (theme: CustomTheme) => void;
  'theme:addWord': (word: string) => void;
  'theme:removeWord': (word: string) => void;

  // Reconnection
  'room:reconnect': (data: { roomCode: string; playerId: string }) => void;
}

// Eventos do Server → Client
export interface ServerToClientEvents {
  // Room updates
  'room:created': (data: { roomCode: string; playerId: string }) => void;
  'room:joined': (data: { playerId: string; roomState: RoomPublicState }) => void;
  'room:updated': (roomState: RoomPublicState) => void;
  'room:playerJoined': (player: PublicPlayer) => void;
  'room:playerLeft': (playerId: string) => void;
  'room:playerDisconnected': (playerId: string) => void;
  'room:playerReconnected': (playerId: string) => void;
  'room:hostChanged': (newHostId: string) => void;
  'room:closed': () => void;

  // Game events
  'game:started': (roomState: RoomPublicState) => void;
  'game:yourWord': (data: { word: string; isImpostor: boolean }) => void;
  'game:allReady': () => void;
  'game:discussionStarted': () => void;
  'game:voteRequested': (data: { requestCount: number; needed: number; requesterId: string }) => void;
  'game:votingStarted': () => void;
  'game:voteRegistered': (data: { votesCount: number; totalPlayers: number }) => void;
  'game:result': (result: GameResult) => void;
  'game:roundReset': (roomState: RoomPublicState) => void;
  'game:reactionReceived': (data: { playerId: string; reaction: string }) => void;

  // Reconnection
  'room:reconnected': (data: { playerId: string; roomState: RoomPublicState; word?: string; isImpostor?: boolean }) => void;

  // Custom Theme Sync (Host only)
  'theme:sync': (words: string[]) => void;

  // Errors
  'error': (data: { code: string; message: string }) => void;
}

// Lista de temas disponíveis (enviada ao client)
export interface ThemeListItem {
  id: string;
  name: string;
  icon: string;
  groupCount: number;
}
