import { io } from 'socket.io-client';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const socket1 = io('http://localhost:3001');
  const socket2 = io('http://localhost:3001');

  socket1.on('error', console.error);
  socket2.on('error', console.error);

  await delay(1000);

  let p1Id, p2Id;
  let p1Num, p2Num;

  socket1.on('room:created', (data) => {
    socket2.emit('room:join', { roomCode: data.roomCode, playerName: 'Player 2', avatar: '2' });
  });

  socket2.on('room:joined', (data) => {
    socket1.emit('room:updateConfig', { numbersMode: 'points' }); // Ensure points mode
    setTimeout(() => {
      socket1.emit('game:start');
    }, 500);
  });

  socket1.emit('room:create', { playerName: 'Player 1', avatar: '1', config: { gameType: GameType.NUMBERS } });

  socket1.on('game:started', (state) => {
    p1Id = state.players.find(p => p.name === 'Player 1').id;
    p2Id = state.players.find(p => p.name === 'Player 2').id;
    p1Num = state.players.find(p => p.id === p1Id).numberValue;
    p2Num = state.players.find(p => p.id === p2Id).numberValue;
    
    console.log(`[P1] guesses P2's number correctly (${p2Num})`);
    socket1.emit('game:guessNumber', { targetId: p2Id, guess: p2Num });
  });

  socket2.on('room:updated', (state) => {
    const p1 = state.players.find(p => p.id === p1Id);
    const p2 = state.players.find(p => p.id === p2Id);
    
    if (state.state === 'in_game') {
      if (p2.inSuddenDeath) {
        console.log(`P2 is in sudden death! P2 hasBeenDiscovered: ${p2.hasBeenDiscovered}, inSuddenDeath: ${p2.inSuddenDeath}`);
        console.log(`[P2] guesses P1's number incorrectly (${p1Num - 1})`);
        socket2.emit('game:guessNumber', { targetId: p1Id, guess: p1Num - 1 });
      }
    } else if (state.state === 'result') {
      console.log("Game is in RESULT state. P2 hasBeenDiscovered:", p2.hasBeenDiscovered);
      console.log("TEST COMPLETE.");
      process.exit(0);
    }
  });
}

runTest();
