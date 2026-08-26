// ============================================
// IMPOSTOR GAME — Socket.io Handlers
// ============================================
import { Server, Socket } from 'socket.io';
import { GameManager } from '../game/GameManager.ts';
import { WordEngine } from '../game/WordEngine.ts';
import { ClientToServerEvents, ServerToClientEvents, RoomConfig, CustomTheme } from '../../../shared/types.ts';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  gameManager: GameManager
): void {

  io.on('connection', (socket: TypedSocket) => {
    console.log(`[Socket] Conectado: ${socket.id}`);

    // ─── CRIAR SALA ─────────────────────────

    socket.on('room:create', (data) => {
      const { playerName, avatar, config, customTheme } = data;

      if (!playerName || playerName.trim().length === 0) {
        socket.emit('error', { code: 'INVALID_NAME', message: 'Nome inválido.' });
        return;
      }

      const room = gameManager.createRoom(config);

      if (customTheme) {
        const words = customTheme.words.map(w => w.trim()).filter(w => w.length > 0);
        room.setCustomTheme({ ...customTheme, words });
      }

      const player = room.addPlayer(socket.id, playerName.trim(), avatar);

      if (!player) {
        socket.emit('error', { code: 'JOIN_FAILED', message: 'Não foi possível criar a sala.' });
        gameManager.removeRoom(room.code);
        return;
      }

      socket.join(room.code);
      socket.emit('room:created', { roomCode: room.code, playerId: player.id });
      socket.emit('room:joined', { playerId: player.id, roomState: room.getPublicState() });

      console.log(`[Room ${room.code}] Criada por ${playerName}`);
    });

    // ─── ENTRAR EM SALA ─────────────────────────

    socket.on('room:join', (data) => {
      const { playerName, avatar, roomCode } = data;

      if (!playerName || playerName.trim().length === 0) {
        socket.emit('error', { code: 'INVALID_NAME', message: 'Nome inválido.' });
        return;
      }

      const code = roomCode.toUpperCase().trim();
      const room = gameManager.getRoom(code);

      if (!room) {
        socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Sala não encontrada.' });
        return;
      }

      if (room.state !== 'LOBBY') {
        socket.emit('error', { code: 'GAME_IN_PROGRESS', message: 'A partida já está em andamento.' });
        return;
      }

      if (room.playerCount >= 8) {
        socket.emit('error', { code: 'ROOM_FULL', message: 'A sala está cheia (8/8).' });
        return;
      }

      const player = room.addPlayer(socket.id, playerName.trim(), avatar);

      if (!player) {
        socket.emit('error', { code: 'JOIN_FAILED', message: 'Não foi possível entrar. Talvez o nome já esteja em uso.' });
        return;
      }

      socket.join(room.code);
      socket.emit('room:joined', { playerId: player.id, roomState: room.getPublicState() });

      // Notificar outros jogadores
      socket.to(room.code).emit('room:playerJoined', {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        isHost: player.isHost,
        isConnected: true,
        hasSeenWord: false,
        hasVoted: false,
        hasRequestedVote: false,
        score: 0,
        isWinner: false,
      });

      // Atualizar estado para todos
      io.to(room.code).emit('room:updated', room.getPublicState());

      console.log(`[Room ${room.code}] ${playerName} entrou (${room.playerCount}/8)`);
    });

    // ─── SAIR DA SALA ─────────────────────────

    socket.on('room:leave', () => {
      handleLeave(socket);
    });

    // ─── ATUALIZAR CONFIG ─────────────────────────

    socket.on('room:updateConfig', (updates) => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      if (room.updateConfig(playerId, updates)) {
        io.to(room.code).emit('room:updated', room.getPublicState());
      }
    });

    // ─── TEMA PERSONALIZADO ─────────────────────────

    socket.on('theme:setCustom', (theme) => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId || !room.isHost(playerId)) return;

      const isValid = WordEngine.validateCustomTheme(theme);
      if (!isValid) {
        socket.emit('error', { code: 'INVALID_THEME', message: 'Tema inválido. O tema precisa ter pelo menos duas palavras.' });
        return;
      }

      room.setCustomTheme(theme);
      io.to(room.code).emit('room:updated', room.getPublicState());
    });

    socket.on('theme:addWord', (word: string) => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      if (room.state !== 'LOBBY') return;
      if (room.addCustomWord(word)) {
        io.to(room.code).emit('room:updated', room.getPublicState());
        
        // Sincroniza a lista completa apenas com o host
        const hostSocket = findSocketByPlayerId(io, room, room.getPublicState().hostId);
        if (hostSocket) {
          hostSocket.emit('theme:sync', room.getCustomThemeWords());
        }
      }
    });

    socket.on('theme:removeWord', (word: string) => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId || !room.isHost(playerId)) return; // Somente host remove palavras
      if (room.state !== 'LOBBY') return;
      
      if (room.removeCustomWord(word)) {
        io.to(room.code).emit('room:updated', room.getPublicState());
        socket.emit('theme:sync', room.getCustomThemeWords());
      }
    });

    // ─── INICIAR JOGO ─────────────────────────

    socket.on('game:start', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      const result = room.startGame(playerId);
      if (!result.success) {
        socket.emit('error', { code: 'START_FAILED', message: result.error || 'Falha ao iniciar.' });
        return;
      }


      // Enviar estado atualizado para todos
      io.to(room.code).emit('game:started', room.getPublicState());

      // Enviar palavra ou número INDIVIDUAL para cada jogador
      const publicState = room.getPublicState();
      for (const player of publicState.players) {
        const playerSocket = findSocketByPlayerId(io, room, player.id);
        if (!playerSocket) continue;

        if (publicState.config.gameType === 'IMPOSTOR' || publicState.config.gameType === 'TESTA') {
          const wordData = room.getPlayerWord(player.id);
          if (wordData) {
            playerSocket.emit('game:wordAssigned', {
              word: wordData.word,
              isImpostor: wordData.isImpostor,
            });
          }
        } else if (publicState.config.gameType === 'NUMBERS') {
          const numberValue = room.getPlayerNumber(player.id);
          if (numberValue !== null) {
            playerSocket.emit('game:numberAssigned', numberValue);
          }
        }
      }

      console.log(`[Room ${room.code}] Jogo iniciado! Rodada ${room.getPublicState().round}`);
    });

    // ─── RESET SCORES ─────────────────────────────
    socket.on('room:resetScores', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      if (room.resetScores(playerId)) {
        io.to(room.code).emit('room:updated', room.getPublicState());
      }
    });

    // ─── TESTA & NUMBERS GUESSES ─────────────────────────────
    socket.on('game:guessTesta', (guess: string) => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      if (room.guessTestaWord(playerId, guess)) {
        io.to(room.code).emit('room:updated', room.getPublicState());
      }
    });

    socket.on('game:giveUpTesta', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      if (room.giveUpTesta(playerId)) {
        io.to(room.code).emit('room:updated', room.getPublicState());
      }
    });

    socket.on('game:guessNumber', (data: { targetId: string, guess: number }) => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      if (room.guessNumber(playerId, data.targetId, data.guess)) {
        io.to(room.code).emit('room:updated', room.getPublicState());
      }
    });

    // ─── PULAR RODADA ─────────────────────────

    socket.on('game:voteSkip', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      const result = room.voteSkip(playerId);
      io.to(room.code).emit('room:updated', room.getPublicState());

      if (result.skipped) {
        // Broadcast de reset (volta pro lobby suavemente)
        io.to(room.code).emit('game:roundReset', room.getPublicState());
      }
    });

    // ─── JOGADOR VIU A PALAVRA ─────────────────────────

    socket.on('game:wordSeen', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      const allReady = room.markWordSeen(playerId);

      // Atualizar estado
      io.to(room.code).emit('room:updated', room.getPublicState());

      if (allReady) {
        io.to(room.code).emit('game:discussionStarted');
      }
    });

    // ─── PEDIR VOTAÇÃO ─────────────────────────

    socket.on('game:requestVote', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      const result = room.requestVote(playerId);
      if (!result) return;

      io.to(room.code).emit('game:voteRequested', {
        requestCount: result.count,
        needed: result.needed,
        requesterId: playerId,
      });

      io.to(room.code).emit('room:updated', room.getPublicState());

      if (result.started) {
        io.to(room.code).emit('game:votingStarted');
        console.log(`[Room ${room.code}] Votação iniciada!`);
      }
    });

    // ─── VOTAR PULAR RODADA ───────────────────
    socket.on('game:voteSkip', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      const result = room.voteSkip(playerId);
      io.to(room.code).emit('room:updated', room.getPublicState());

      if (result.skipped) {
        console.log(`[Room ${room.code}] Rodada pulada!`);
      }
    });

    // ─── CHAT ─────────────────────────────
    socket.on('chat:sendMessage', (text: string) => {
      const room = findRoomBySocket(socket);
      if (!room || !text || text.trim() === '') return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      const player = room.getPublicState().players.find(p => p.id === playerId);
      if (!player) return;

      const message = {
        id: Math.random().toString(36).substring(2, 9),
        playerId,
        playerName: player.name,
        text: text.trim().substring(0, 200), // Limit text length
        timestamp: Date.now(),
      };

      io.to(room.code).emit('chat:newMessage', message);
    });

    // ─── VOTAR ─────────────────────────

    socket.on('game:vote', (votedForId) => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      const result = room.submitVote(playerId, votedForId);
      if (!result.success) {
        socket.emit('error', { code: 'VOTE_FAILED', message: result.error || 'Falha ao votar.' });
        return;
      }

      // Notificar todos sobre progresso
      io.to(room.code).emit('game:voteRegistered', {
        votesCount: room.getVotesCount(),
        totalPlayers: room.playerCount,
      });

      io.to(room.code).emit('room:updated', room.getPublicState());

      if (result.allVoted) {
        // Calcular e enviar resultado
        setTimeout(() => {
          const gameResult = room.calculateResult();
          io.to(room.code).emit('game:result', gameResult);
          io.to(room.code).emit('room:updated', room.getPublicState());
          console.log(`[Room ${room.code}] Resultado: impostores ${gameResult.impostorsFound ? 'descobertos' : 'escaparam'}!`);
        }, 3000); // Delay de 3s para suspense
      }
    });

    // ─── REAÇÕES ─────────────────────────

    socket.on('game:reaction', (reaction: string) => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      io.to(room.code).emit('game:reactionReceived', { playerId, reaction });
    });

    // ─── PRÓXIMA RODADA ─────────────────────────

    socket.on('game:nextRound', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId || !room.isHost(playerId)) return;

      const result = room.playAgain(playerId);
      if (result.success) {
        // Emit started which resets words and goes straight to game
        io.to(room.code).emit('game:started', room.getPublicState());
        
        // Broadcast words again for impostor
        if (room.config.gameType === GameType.IMPOSTOR) {
          for (const p of room.getPlayers()) {
            const playerSocket = getSocketByPlayerId(p.id);
            if (playerSocket && p.word) {
              playerSocket.emit('game:wordAssigned', {
                word: p.word,
                isImpostor: !!p.isImpostor,
              });
            }
          }
        } else if (room.config.gameType === GameType.NUMBERS) {
           for (const p of room.getPlayers()) {
            const playerSocket = getSocketByPlayerId(p.id);
            if (playerSocket && p.numberValue) {
              playerSocket.emit('game:numberAssigned', p.numberValue);
            }
          }
        }
      } else if (result.error) {
        socket.emit('error', { code: 'START_ERROR', message: result.error });
      }
    });

    // ─── VOLTAR AO LOBBY (MUDAR TEMA) ─────────────────────────

    socket.on('game:changeTheme', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId || !room.isHost(playerId)) return;

      if (room.prepareNextRound()) {
        io.to(room.code).emit('game:roundReset', room.getPublicState());
        io.to(room.code).emit('room:updated', room.getPublicState());
      }
    });

    // ─── RECONEXÃO ─────────────────────────

    socket.on('room:reconnect', (data) => {
      const { roomCode, playerId } = data;
      const room = gameManager.getRoom(roomCode);

      if (!room) {
        socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Sala não encontrada.' });
        return;
      }

      const player = room.reconnectPlayer(socket.id, playerId);
      if (!player) {
        socket.emit('error', { code: 'RECONNECT_FAILED', message: 'Não foi possível reconectar.' });
        return;
      }

      socket.join(room.code);

      const wordData = room.getPlayerWord(playerId);
      socket.emit('room:reconnected', {
        playerId,
        roomState: room.getPublicState(),
        word: wordData?.word,
        isImpostor: wordData?.isImpostor,
      });

      socket.to(room.code).emit('room:playerReconnected', playerId);
      io.to(room.code).emit('room:updated', room.getPublicState());

      console.log(`[Room ${room.code}] ${player.name} reconectou`);
    });

    // ─── DESCONEXÃO ─────────────────────────

    socket.on('disconnect', () => {
      console.log(`[Socket] Desconectado: ${socket.id}`);
      handleDisconnect(socket);
    });

    // ─── Helper Functions ─────────────────────────

    function findRoomBySocket(s: TypedSocket): ReturnType<typeof gameManager.getRoom> {
      const rooms = Array.from(s.rooms).filter(r => r !== s.id);
      for (const roomCode of rooms) {
        const room = gameManager.getRoom(roomCode);
        if (room) return room;
      }
      return undefined;
    }

    function findSocketByPlayerId(
      ioServer: Server<ClientToServerEvents, ServerToClientEvents>,
      room: NonNullable<ReturnType<typeof gameManager.getRoom>>,
      playerId: string
    ): TypedSocket | undefined {
      const sockets = ioServer.sockets.sockets;
      for (const [sid, s] of sockets) {
        if (room.getPlayerIdBySocket(sid) === playerId) {
          return s as TypedSocket;
        }
      }
      return undefined;
    }

    function handleLeave(s: TypedSocket): void {
      const room = findRoomBySocket(s);
      if (!room) return;

      const result = room.removePlayer(s.id);
      if (!result) return;

      s.leave(room.code);
      s.to(room.code).emit('room:playerLeft', result.player.id);

      if (result.newHostId) {
        io.to(room.code).emit('room:hostChanged', result.newHostId);
      }

      // Se a sala ficou vazia, remover
      if (room.playerCount === 0) {
        gameManager.removeRoom(room.code);
      } else {
        io.to(room.code).emit('room:updated', room.getPublicState());
      }

      console.log(`[Room ${room.code}] ${result.player.name} saiu`);
    }

    function handleDisconnect(s: TypedSocket): void {
      const room = findRoomBySocket(s);
      if (!room) return;

      const result = room.handleDisconnect(s.id);
      if (!result) return;

      s.to(room.code).emit('room:playerDisconnected', result.playerId);
      io.to(room.code).emit('room:updated', room.getPublicState());
    }
  });
}


