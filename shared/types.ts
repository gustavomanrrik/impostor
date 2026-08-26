// ============================================
// IMPOSTOR GAME — Tipos Compartilhados
// ============================================

export enum GameType {
  IMPOSTOR = 'IMPOSTOR',
  TESTA = 'TESTA',
  NUMBERS = 'NUMBERS'
}

// Estados da máquina de estados do jogo
export enum GameState {
  LOBBY = 'LOBBY',
  STARTING = 'STARTING',
  // Impostor specific
  WORD_REVEAL = 'WORD_REVEAL',
  DISCUSSION = 'DISCUSSION',
  VOTING_REQUEST = 'VOTING_REQUEST',
  VOTING = 'VOTING',
  REVEALING = 'REVEALING',
  // Generic / Shared
  RESULT = 'RESULT',
  IN_GAME = 'IN_GAME', // For Testa and Numbers
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
  imageUrl?: string;
  timestamp: number;
}

// Jogador
export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isConnected: boolean;
  score: number;
  isWinner?: boolean;
  
  // Impostor Props
  isImpostor?: boolean;
  word?: string;
  hasSeenWord?: boolean;
  hasVoted?: boolean;
  hasRequestedVote?: boolean;
  votedFor?: string;
  hasVotedSkip?: boolean;
  
  // Testa Props
  testaWord?: string;
  hasGuessedTesta?: boolean;
  
  // Numbers Props
  numberValue?: number;
  discoveredNumbers?: string[]; // IDs of players whose number this player has discovered
  hasBeenDiscovered?: boolean;
}

// Configuração da sala
export interface RoomConfig {
  gameType: GameType;
  theme: string;
  customThemeId?: string;
  difficulty: Difficulty;
  impostorMode: ImpostorMode;
  customImpostorCount: number;
  discussionTimeLimit: number;
  showImpostorCount: boolean;
  soundEnabled: boolean;
  useFlatMode?: boolean;
  testaLives: number; // 0 = infinito
  
  // Numbers specific config
  numbersMin?: number;
  numbersMax?: number;
}

// Grupo de pares por dificuldade
export interface ThemePairs {
  easy: string[][];
  medium: string[][];
  hard: string[][];
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
  score: number;
  isWinner?: boolean;
  
  // Impostor
  hasSeenWord: boolean;
  hasVoted: boolean;
  hasRequestedVote: boolean;
  hasVotedSkip?: boolean;
  
  // Testa
  testaWord?: string;
  hasGuessedTesta?: boolean;
  testaLivesLeft?: number;
  
  // Numbers
  numberValue?: number;
  hasBeenDiscovered?: boolean;
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
  'room:resetScores': () => void;

  // Chat
  'chat:sendMessage': (message: string) => void;
  'chat:sendImage': (imageUrl: string) => void;

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
  
  // New Games
  'game:guessTesta': (guess: string) => void;
  'game:giveUpTesta': () => void;
  'game:guessNumber': (data: { targetId: string, guess: number }) => void;

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

  // Chat
  'chat:newMessage': (message: { id: string; playerId: string; playerName: string; text: string; timestamp: number; isSystem?: boolean }) => void;

  // Game specific
  'game:wordAssigned': (data: { word: string; isImpostor: boolean }) => void;
  'game:numberAssigned': (numberValue: number) => void;
  'game:started': (roomState: RoomPublicState) => void;
  'game:allReady': () => void;
  'game:voteStarted': () => void;
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
  is18Plus?: boolean;
}
