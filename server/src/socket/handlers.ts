// ============================================
// IMPOSTOR GAME — Socket.io Handlers
// ============================================
import { Server, Socket } from 'socket.io';
import { GameManager } from '../game/GameManager';
import { WordEngine } from '../game/WordEngine';
import { ClientToServerEvents, ServerToClientEvents, RoomConfig, CustomTheme, GameType, ChatMessage } from '../../../shared/types';

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
      const { playerName, avatar, roomCode, password } = data;

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

      if (room.config.password && room.config.password !== password) {
        socket.emit('error', { code: 'INVALID_PASSWORD', message: 'Senha incorreta.' });
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

    // ─── SAIR DA SALA ──────────────────────────────────────────
    
    socket.on('room:leave', () => {
      handleLeave(socket);
    });

    socket.on('room:kick', (playerIdToKick: string) => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const myPlayerId = room.getPlayerIdBySocket(socket.id);
      if (!myPlayerId || !room.isHost(myPlayerId)) return; // Only host can kick

      const targetSocket = findSocketByPlayerId(io, room, playerIdToKick);
      if (targetSocket) {
        // Send a custom kick event to force the client to leave
        targetSocket.emit('error', { code: 'KICKED', message: 'Você foi removido da sala pelo Host.' });
        handleLeave(targetSocket);
      }
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

    socket.on('game:start', (force?: boolean) => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      const result = room.startGame(playerId, force);
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

        if (publicState.config.gameType === GameType.IMPOSTOR || publicState.config.gameType === GameType.TESTA) {
          const wordData = room.getPlayerWord(player.id);
          if (wordData) {
            playerSocket.emit('game:wordAssigned', {
              word: wordData.word,
              isImpostor: wordData.isImpostor,
            });
          }
        } else if (publicState.config.gameType === GameType.NUMBERS) {
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

    // 🎯 TESTA & NUMBERS GUESSES 🎯
    socket.on('game:guessTesta', (guess: string, callback?: (res: { correct: boolean }) => void) => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      const result = room.guessTestaWord(playerId, guess);
      
      io.to(room.code).emit('room:testaGuessAttempt', {
        playerId,
        guess,
        correct: result.correct
      });

      if (callback) {
        callback({ correct: result.correct });
      }

      // Always broadcast updated state so all players see sudden death, lives, etc.
      io.to(room.code).emit('room:updated', room.getPublicState());
        
      // Chat message on life loss
      if (!result.correct && result.livesLeft !== undefined) {
        const player = room.getPublicState().players.find(p => p.id === playerId);
        if (player) {
          const message = {
            id: Math.random().toString(36).substring(2, 9),
            playerId: 'system',
            playerName: 'Sistema',
            text: result.livesLeft === 0 
              ? `${player.name} perdeu todos os corações e foi eliminado!`
              : `${player.name} errou e perdeu um coração! (${result.livesLeft} restante${result.livesLeft !== 1 ? 's' : ''})`,
            timestamp: Date.now(),
          };
          io.to(room.code).emit('chat:newMessage', message);
        }
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

    socket.on('game:guessNumber', (data: { targetId: string, guess: number }, callback?: (res: { correct: boolean }) => void) => {
      const room = findRoomBySocket(socket);
      if (!room) return;
      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      const correct = room.guessNumber(playerId, data.targetId, data.guess);
      
      if (callback) {
        callback({ correct });
      }

      io.to(room.code).emit('room:updated', room.getPublicState());
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

    socket.on('game:cancelVoteRequest', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      const result = room.cancelVoteRequest(playerId);
      if (!result) return;

      io.to(room.code).emit('game:voteRequested', {
        requestCount: result.count,
        needed: result.needed,
        requesterId: playerId,
      });

      io.to(room.code).emit('room:updated', room.getPublicState());
    });

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


    // ─── CHAT ─────────────────────────────
    socket.on('chat:sendMessage', (text: string) => {
      const room = findRoomBySocket(socket);
      if (!room || !text || text.trim() === '') return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      const player = room.getPublicState().players.find(p => p.id === playerId);
      if (!player) return;

      const message: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        playerId,
        playerName: player.name,
        text: text.trim().substring(0, 200), // Limit text length
        timestamp: Date.now(),
      };

      io.to(room.code).emit('chat:newMessage', message);
    });

    socket.on('game:sendWhisper', (targetPlayerId: string, text: string) => {
      const room = findRoomBySocket(socket);
      if (!room || !text || text.trim() === '' || !targetPlayerId) return;

      const senderId = room.getPlayerIdBySocket(socket.id);
      if (!senderId) return;

      const targetSocketId = room.getSocketIdByPlayerId(targetPlayerId);
      if (targetSocketId && targetSocketId !== socket.id) {
        io.to(targetSocketId).emit('game:whisperReceived', { senderId, text: text.trim().substring(0, 200) });
      }
    });

    socket.on('chat:react', (messageId: string, reaction: string) => {
      const room = findRoomBySocket(socket);
      if (!room || !messageId || !reaction) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;

      io.to(room.code).emit('chat:messageReaction', { messageId, playerId, reaction });
    });

    socket.on('chat:sendImage', (imageUrl: string) => {
      const room = findRoomBySocket(socket);
      if (!room || !imageUrl || !imageUrl.startsWith('data:image/')) return;

      // Limit payload size to prevent abuse (~500KB base64 is ~666KB string length)
      if (imageUrl.length > 700000) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      const player = room.getPublicState().players.find(p => p.id === playerId);
      if (!player) return;

      const message = {
        id: Math.random().toString(36).substring(2, 9),
        playerId,
        playerName: player.name,
        text: '',
        imageUrl: imageUrl,
        timestamp: Date.now(),
      };

      io.to(room.code).emit('chat:newMessage', message);
    });

    socket.on('chat:sendAudio', (audioUrl: string) => {
      const room = findRoomBySocket(socket);
      // Let's accept data:audio/ for audio attachments/recordings
      if (!room || !audioUrl || !audioUrl.startsWith('data:audio/')) return;

      // Limit payload size (audio can be larger, let's say 2MB base64 ~ 2.6MB string length)
      if (audioUrl.length > 2800000) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId) return;
      
      const player = room.getPublicState().players.find(p => p.id === playerId);
      if (!player) return;

      const message = {
        id: Math.random().toString(36).substring(2, 9),
        playerId,
        playerName: player.name,
        text: '',
        audioUrl: audioUrl,
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

      const result = room.nextRound(playerId);
      if (result.success) {
        // Emit started which resets words and goes straight to game
        io.to(room.code).emit('game:started', room.getPublicState());
        
        // Broadcast words again for impostor
        if (room.config.gameType === GameType.IMPOSTOR || room.config.gameType === GameType.TESTA) {
          for (const p of room.players.values()) {
            const playerSocket = findSocketByPlayerId(io, room, p.id);
            if (playerSocket) {
              const wordData = room.getPlayerWord(p.id);
              if (wordData) {
                io.to(playerSocket.id).emit('game:wordAssigned', { word: wordData.word, isImpostor: !!wordData.isImpostor });
              }
            }
          }
        } else if (room.config.gameType === GameType.NUMBERS) {
          for (const p of room.players.values()) {
            const playerSocket = findSocketByPlayerId(io, room, p.id);
            if (playerSocket && p.numberValue) {
              io.to(playerSocket.id).emit('game:numberAssigned', p.numberValue);
            }
          }
        }
      }
    });

    socket.on('game:playAgain', () => {
      const room = findRoomBySocket(socket);
      if (!room) return;

      const playerId = room.getPlayerIdBySocket(socket.id);
      if (!playerId || !room.isHost(playerId)) return;

      const result = room.playAgain(playerId);
      if (result.success) {
        // Emit started which resets words and goes straight to game
        io.to(room.code).emit('game:started', room.getPublicState());
        
        // Broadcast words again for impostor
        if (room.config.gameType === GameType.IMPOSTOR || room.config.gameType === GameType.TESTA) {
          for (const p of room.players.values()) {
            const playerSocket = findSocketByPlayerId(io, room, p.id);
            if (playerSocket) {
              const wordData = room.getPlayerWord(p.id);
              if (wordData) {
                io.to(playerSocket.id).emit('game:wordAssigned', { word: wordData.word, isImpostor: !!wordData.isImpostor });
              }
            }
          }
        } else if (room.config.gameType === GameType.NUMBERS) {
          for (const p of room.players.values()) {
            const playerSocket = findSocketByPlayerId(io, room, p.id);
            if (playerSocket && p.numberValue) {
              io.to(playerSocket.id).emit('game:numberAssigned', p.numberValue);
            }
          }
        }
      } else if (result.error) {
        socket.emit('error', { code: 'START_ERROR', message: result.error });
      }
    });

    // ─── LISTAR SALAS PÚBLICAS ─────────────────────────

    socket.on('room:listPublic', () => {
      try {
        const rooms = gameManager.getPublicRooms();
        socket.emit('room:publicList', rooms);
      } catch (err: any) {
        console.error(err);
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
      const numberValue = room.getPlayerNumber(playerId);
      socket.emit('room:reconnected', {
        playerId,
        roomState: room.getPublicState(),
        word: wordData?.word,
        isImpostor: wordData?.isImpostor,
        numberValue: numberValue ?? undefined,
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

      const result = room.handleDisconnect(s.id, () => {
        io.to(room.code).emit('room:updated', room.getPublicState());
      });
      if (!result) return;

      const connectedCount = Array.from(room.players.values()).filter(p => p.isConnected).length;
      if (connectedCount === 0) {
        gameManager.removeRoom(room.code);
        console.log(`[Room ${room.code}] deleted because it is empty.`);
        return;
      }

      if (result.shouldRemove) {
        handleLeave(s);
      } else {
        s.to(room.code).emit('room:playerDisconnected', result.playerId);
        io.to(room.code).emit('room:updated', room.getPublicState());
      }
    }
  });
}


