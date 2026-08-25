// ============================================
// IMPOSTOR GAME — Room (Sala de Jogo)
// ============================================
import { v4 as uuidv4 } from 'uuid';
import {
  GameState, Player, RoomConfig, RoomPublicState, PublicPlayer,
  Difficulty, ImpostorMode, WordSelection, Vote, VoteResult,
  GameResult, CustomTheme,
} from '../../../shared/types.ts';
import { StateMachine } from './StateMachine.ts';
import { WordEngine } from './WordEngine.ts';

export class Room {
  readonly code: string;
  private players: Map<string, Player> = new Map();
  private stateMachine: StateMachine = new StateMachine();
  private config: RoomConfig;
  private hostId: string = '';
  private currentWords: WordSelection | null = null;
  private impostorIds: Set<string> = new Set();
  private votes: Map<string, string> = new Map(); // voterId -> votedForId
  private voteRequests: Set<string> = new Set();
  private round: number = 0;
  private customTheme: CustomTheme | null = null;
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private skipVotes: Set<string> = new Set();
  private totalSubmittedWords: number = 0;

  // Socket IDs mapeados para player IDs (para reconexão)
  private socketToPlayer: Map<string, string> = new Map();

  constructor(code: string, config?: Partial<RoomConfig>) {
    this.code = code;
    this.config = {
      theme: 'relacionamentos',
      difficulty: Difficulty.MEDIUM,
      impostorMode: ImpostorMode.AUTO,
      customImpostorCount: 1,
      discussionTimeLimit: 0,
      showImpostorCount: true,
      soundEnabled: true,
      ...config,
    };
  }

  // ─── Getters ─────────────────────────────

  get state(): GameState {
    return this.stateMachine.state;
  }

  get playerCount(): number {
    return this.players.size;
  }

  get host(): string {
    return this.hostId;
  }

  // ─── Configuration ─────────────────────────
  updateConfig(playerId: string, newConfig: Partial<RoomConfig>): boolean {
    if (playerId !== this.hostId) return false;
    this.config = { ...this.config, ...newConfig };
    return true;
  }

  // ─── Player Management ─────────────────────

  addPlayer(socketId: string, name: string, avatar: string): Player | null {
    if (this.players.size >= 8) return null;
    if (this.state !== GameState.LOBBY) return null;

    // Verificar nome duplicado
    for (const p of this.players.values()) {
      if (p.name.toLowerCase() === name.toLowerCase()) {
        return null;
      }
    }

    const playerId = uuidv4();
    const isHost = this.players.size === 0;

    const player: Player = {
      id: playerId,
      name,
      avatar,
      isHost,
      isConnected: true,
      hasSeenWord: false,
      hasVoted: false,
      hasRequestedVote: false,
    };

    this.players.set(playerId, player);
    this.socketToPlayer.set(socketId, playerId);

    if (isHost) {
      this.hostId = playerId;
    }

    return player;
  }

  removePlayer(socketId: string): { player: Player; newHostId?: string } | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;

    const player = this.players.get(playerId);
    if (!player) return null;

    this.socketToPlayer.delete(socketId);
    this.players.delete(playerId);
    this.impostorIds.delete(playerId);
    this.votes.delete(playerId);
    this.voteRequests.delete(playerId);

    let newHostId: string | undefined;

    // Se era o host, transferir
    if (player.isHost && this.players.size > 0) {
      const nextPlayer = this.players.values().next().value;
      if (nextPlayer) {
        nextPlayer.isHost = true;
        this.hostId = nextPlayer.id;
        newHostId = nextPlayer.id;
      }
    }

    return { player, newHostId };
  }

  handleDisconnect(socketId: string): { playerId: string; shouldRemove: boolean } | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;

    const player = this.players.get(playerId);
    if (!player) return null;

    player.isConnected = false;

    // Em lobby, remover após 30 segundos
    if (this.state === GameState.LOBBY) {
      const timer = setTimeout(() => {
        this.removePlayer(socketId);
        this.disconnectTimers.delete(playerId);
      }, 30000);
      this.disconnectTimers.set(playerId, timer);
      return { playerId, shouldRemove: false };
    }

    // Em jogo, manter por 2 minutos
    const timer = setTimeout(() => {
      // Após 2 min, se ainda desconectado, marcar como bot/skip
      const p = this.players.get(playerId);
      if (p && !p.isConnected) {
        // Auto-vote (votar em ninguém ou skip)
        this.disconnectTimers.delete(playerId);
      }
    }, 120000);
    this.disconnectTimers.set(playerId, timer);

    return { playerId, shouldRemove: false };
  }

  reconnectPlayer(socketId: string, playerId: string): Player | null {
    const player = this.players.get(playerId);
    if (!player) return null;

    // Limpar timer de desconexão
    const timer = this.disconnectTimers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(playerId);
    }

    // Atualizar socket mapping
    // Remover socket antigo se existir
    for (const [sid, pid] of this.socketToPlayer) {
      if (pid === playerId) {
        this.socketToPlayer.delete(sid);
      }
    }
    this.socketToPlayer.set(socketId, playerId);

    player.isConnected = true;
    return player;
  }

  getPlayerIdBySocket(socketId: string): string | undefined {
    return this.socketToPlayer.get(socketId);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  isHost(playerId: string): boolean {
    return this.hostId === playerId;
  }

  // ─── Config ─────────────────────────────

  updateConfig(playerId: string, updates: Partial<RoomConfig>): boolean {
    if (!this.isHost(playerId)) return false;
    if (this.state !== GameState.LOBBY) return false;

    this.config = { ...this.config, ...updates };
    return true;
  }

  setCustomTheme(theme: CustomTheme): void {
    this.customTheme = theme;
    this.config.theme = 'custom';
    this.config.customThemeId = theme.id;
  }

  addCustomWord(word: string): boolean {
    if (!this.customTheme) {
      this.customTheme = { id: 'colab', name: 'Tema Colaborativo', words: [] };
      this.config.theme = 'custom';
    }
    const cleanWord = word.trim();
    if (!cleanWord) return false;

    // Incrementa sempre para esconder de quem enviou que a palavra foi repetida
    this.totalSubmittedWords++;

    const isDuplicate = this.customTheme.words.some(w => w.toLowerCase() === cleanWord.toLowerCase());
    if (!isDuplicate) {
      this.customTheme.words.push(cleanWord);
    }
    
    return true;
  }

  removeCustomWord(word: string): boolean {
    if (!this.customTheme) return false;
    const initialLength = this.customTheme.words.length;
    this.customTheme.words = this.customTheme.words.filter(w => w !== word);
    if (this.customTheme.words.length < initialLength) {
      this.totalSubmittedWords = Math.max(0, this.totalSubmittedWords - 1);
      return true;
    }
    return false;
  }

  getCustomThemeWords(): string[] {
    return this.customTheme?.words || [];
  }

  // ─── Game Flow ─────────────────────────────

  startGame(playerId: string): { success: boolean; error?: string } {
    if (!this.isHost(playerId)) {
      return { success: false, error: 'Somente o host pode iniciar a partida.' };
    }

    if (this.players.size < 3) {
      return { success: false, error: 'São necessários pelo menos 3 jogadores.' };
    }

    // Validar custom theme
    if (this.config.theme === 'custom' && this.customTheme) {
      if (this.customTheme.words.length < 4) {
        return { success: false, error: `O tema precisa de 4 palavras ÚNICAS. No momento temos apenas ${this.customTheme.words.length}.` };
      }
    }

    if (!this.stateMachine.canTransition(GameState.STARTING)) {
      return { success: false, error: 'Não é possível iniciar neste momento.' };
    }

    // Calcular número de impostores
    const impostorCount = this.getImpostorCount();
    if (impostorCount >= this.players.size) {
      return { success: false, error: 'Muitos impostores para o número de jogadores.' };
    }

    // Selecionar palavras
    const words = WordEngine.selectWords(
      this.config.theme,
      this.config.difficulty,
      [], // usedGroupIds será passado pelo client
      this.customTheme || undefined,
      this.config.useFlatMode
    );

    if (!words) {
      return { success: false, error: 'Não foi possível selecionar palavras para este tema.' };
    }

    this.currentWords = words;
    this.round++;

    // Sortear impostores
    const playerIds = Array.from(this.players.keys());
    this.shuffleArray(playerIds);
    this.impostorIds = new Set(playerIds.slice(0, impostorCount));

    // Distribuir palavras para cada jogador
    for (const [id, player] of this.players) {
      const isImpostor = this.impostorIds.has(id);
      player.isImpostor = isImpostor;
      player.word = isImpostor ? words.impostorWord : words.normalWord;
      player.hasSeenWord = false;
      player.hasVoted = false;
      player.hasRequestedVote = false;
      player.votedFor = undefined;
    }

    // Limpar votos
    this.votes.clear();
    this.voteRequests.clear();

    this.stateMachine.transition(GameState.STARTING);
    this.stateMachine.transition(GameState.WORD_REVEAL);

    return { success: true };
  }

  markWordSeen(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.hasSeenWord = true;

    // Verificar se todos viram
    const allSeen = Array.from(this.players.values()).every(p => p.hasSeenWord);
    if (allSeen && this.stateMachine.canTransition(GameState.DISCUSSION)) {
      this.stateMachine.transition(GameState.DISCUSSION);
      return true; // indica transição para discussion
    }

    return false;
  }

  allPlayersSeenWord(): boolean {
    return Array.from(this.players.values()).every(p => p.hasSeenWord);
  }

  // ─── Voting ─────────────────────────────

  requestVote(playerId: string): { count: number; needed: number; started: boolean } | null {
    if (this.state !== GameState.DISCUSSION && this.state !== GameState.VOTING_REQUEST) return null;

    const player = this.players.get(playerId);
    if (!player) return null;

    if (player.hasRequestedVote) return null;

    player.hasRequestedVote = true;
    this.voteRequests.add(playerId);

    const needed = this.getVoteRequestsNeeded();
    const count = this.voteRequests.size;
    const started = count >= needed;

    if (started) {
      this.stateMachine.forceState(GameState.VOTING);
    }

    return { count, needed, started };
  }

  cancelVoteRequest(playerId: string): boolean {
    if (this.state !== GameState.DISCUSSION) return false;
    
    const player = this.players.get(playerId);
    if (!player) return false;

    player.hasRequestedVote = false;
    this.voteRequests.delete(playerId);
    return true;
  }

  voteSkip(playerId: string): { skipped: boolean } {
    if (this.state !== GameState.WORD_REVEAL && this.state !== GameState.DISCUSSION) return { skipped: false };
    
    const player = this.players.get(playerId);
    if (!player || !player.isConnected) return { skipped: false };

    this.skipVotes.add(playerId);
    player.hasVotedSkip = true;

    // Check if all connected alive players voted to skip
    const connectedPlayers = Array.from(this.players.values()).filter(p => p.isConnected);
    if (this.skipVotes.size === connectedPlayers.length && connectedPlayers.length > 0) {
      this.prepareNextRound();
      return { skipped: true };
    }

    return { skipped: false };
  }

  submitVote(playerId: string, votedForId: string): { success: boolean; allVoted: boolean; error?: string } {
    if (this.state !== GameState.VOTING) {
      return { success: false, allVoted: false, error: 'Não é hora de votar.' };
    }

    const voter = this.players.get(playerId);
    if (!voter) {
      return { success: false, allVoted: false, error: 'Jogador não encontrado.' };
    }

    if (voter.hasVoted) {
      return { success: false, allVoted: false, error: 'Você já votou.' };
    }

    if (playerId === votedForId) {
      return { success: false, allVoted: false, error: 'Você não pode votar em si mesmo.' };
    }

    if (!this.players.has(votedForId)) {
      return { success: false, allVoted: false, error: 'Jogador votado não encontrado.' };
    }

    voter.hasVoted = true;
    voter.votedFor = votedForId;
    this.votes.set(playerId, votedForId);

    const allVoted = Array.from(this.players.values())
      .filter(p => p.isConnected)
      .every(p => p.hasVoted);

    if (allVoted) {
      this.stateMachine.forceState(GameState.REVEALING);
    }

    return { success: true, allVoted };
  }

  getVotesCount(): number {
    return this.votes.size;
  }

  // ─── Results ─────────────────────────────

  calculateResult(): GameResult {
    // Contar votos
    const voteCounts = new Map<string, number>();
    for (const votedFor of this.votes.values()) {
      voteCounts.set(votedFor, (voteCounts.get(votedFor) || 0) + 1);
    }

    // Criar resultados ordenados
    const voteResults: VoteResult[] = Array.from(this.players.entries()).map(([id, p]) => ({
      playerId: id,
      playerName: p.name,
      voteCount: voteCounts.get(id) || 0,
    })).sort((a, b) => b.voteCount - a.voteCount);

    // Determinar eliminado (mais votado)
    const maxVotes = voteResults[0]?.voteCount || 0;
    const mostVoted = voteResults.filter(v => v.voteCount === maxVotes);

    // Se empate, ninguém é eliminado
    let eliminatedPlayer: { id: string; name: string } | null = null;
    if (mostVoted.length === 1 && maxVotes > 0) {
      eliminatedPlayer = {
        id: mostVoted[0].playerId,
        name: mostVoted[0].playerName,
      };
    }

    // Verificar se os impostores foram descobertos
    const impostors = Array.from(this.impostorIds).map(id => {
      const p = this.players.get(id)!;
      return { id, name: p.name };
    });

    let impostorsDiscovered = 0;
    if (eliminatedPlayer && this.impostorIds.has(eliminatedPlayer.id)) {
      impostorsDiscovered = 1;
    }

    const impostorsFound = impostorsDiscovered === this.impostorIds.size;

    this.stateMachine.forceState(GameState.RESULT);

    return {
      impostorsFound,
      impostors,
      normalWord: this.currentWords!.normalWord,
      impostorWord: this.currentWords!.impostorWord,
      themeName: this.currentWords!.themeName,
      votes: voteResults,
      eliminatedPlayer,
      impostorsDiscovered,
      totalImpostors: this.impostorIds.size,
    };
  }

  // ─── Next Round ─────────────────────────────

  prepareNextRound(): boolean {
    if (this.state !== GameState.RESULT && this.state !== GameState.DISCUSSION && this.state !== GameState.WORD_REVEAL) return false;
    this.stateMachine.forceState(GameState.LOBBY);

    // Reset round state
    this.votes.clear();
    this.voteRequests.clear();
    this.skipVotes.clear();
    
    for (const p of this.players.values()) {
      p.hasSeenWord = false;
      p.hasVoted = false;
      p.hasRequestedVote = false;
      p.hasVotedSkip = false;
      p.votedFor = undefined;
      p.isImpostor = undefined;
      p.word = undefined;
    }

    this.impostorIds.clear();
    this.currentWords = null;

    return true;
  }

  // ─── Public State ─────────────────────────────

  getPublicState(): RoomPublicState {
    const publicPlayers: PublicPlayer[] = Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isHost: p.isHost,
      isConnected: p.isConnected,
      hasSeenWord: p.hasSeenWord || false,
      hasVoted: p.hasVoted || false,
      hasRequestedVote: p.hasRequestedVote || false,
      hasVotedSkip: p.hasVotedSkip || false,
    }));

    return {
      code: this.code,
      state: this.state,
      players: publicPlayers,
      config: this.config,
      hostId: this.hostId,
      voteRequestCount: this.voteRequests.size,
      voteRequestsNeeded: this.getVoteRequestsNeeded(),
      votesRegistered: Array.from(this.players.values()).filter(p => p.hasVoted).length,
      totalPlayers: this.players.size,
      round: this.round,
      customThemeWordCount: this.totalSubmittedWords,
    };
  }

  getPlayerWord(playerId: string): { word: string; isImpostor: boolean } | null {
    const player = this.players.get(playerId);
    if (!player || !player.word) return null;
    return { word: player.word, isImpostor: player.isImpostor || false };
  }

  getWordGroupId(): string | null {
    return this.currentWords?.groupId || null;
  }

  // ─── Helpers ─────────────────────────────

  private getImpostorCount(): number {
    return Math.max(1, Math.min(this.config.customImpostorCount, this.players.size - 1));
  }

  private getVoteRequestsNeeded(): number {
    // Pelo menos metade dos jogadores (arredondado para cima, mínimo 2)
    return Math.max(2, Math.ceil(this.players.size / 2));
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // ─── Cleanup ─────────────────────────────

  cleanup(): void {
    for (const timer of this.disconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.disconnectTimers.clear();
  }
}


