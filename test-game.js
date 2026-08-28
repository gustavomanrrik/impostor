import { io } from 'socket.io-client';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log("Starting test...");
  const socket1 = io('http://localhost:3001');
  const socket2 = io('http://localhost:3001');

  socket1.on('error', console.error);
  socket2.on('error', console.error);

  await delay(1000); // wait to connect
  console.log("Connected? ", socket1.connected, socket2.connected);

  let p1Id, p2Id;

  socket1.on('room:created', (data) => {
    console.log('Room created:', data.roomCode); console.log('Config:', data.roomState.config);
    socket2.emit('room:join', { roomCode: data.roomCode, playerName: 'Player 2', avatar: '2' });
  });

  socket2.on('room:joined', (data) => {
    console.log('Player 2 joined!', data.roomState.config);
    socket1.emit('room:updateConfig', { gameType: 'numbers' });
    setTimeout(() => {
      console.log("Starting game...");
      socket1.emit('game:start');
    }, 500);
  });

  socket1.emit('room:create', { playerName: 'Player 1', avatar: '1', config: { gameType: 'numbers' } });

  let p1Num, p2Num;

  socket1.on('game:started', (state) => {
    console.log("Game Started (Round " + state.currentRound + ")!");
    p1Id = state.players.find(p => p.name === 'Player 1').id;
    p2Id = state.players.find(p => p.name === 'Player 2').id;
    p1Num = state.players.find(p => p.id === p1Id).numberValue;
    p2Num = state.players.find(p => p.id === p2Id).numberValue;
    console.log(`P1: ${p1Num}, P2: ${p2Num}`);

    // Let's have P1 guess P2's number
    setTimeout(() => {
      console.log(`P1 guessing P2's number (${p2Num})...`);
      socket1.emit('game:guessNumber', { targetId: p2Id, guess: p2Num });
    }, 1000);
  });

  socket2.on('room:updated', (state) => {
    if (state.state === 'result') {
      console.log("Game is in RESULT state. Scores:");
      state.players.forEach(p => console.log(`${p.name}: ${p.score}`));
      
      // P1 starts next round
      if (state.currentRound === 1) {
        setTimeout(() => {
          console.log("Starting round 2...");
          socket1.emit('game:nextRound');
        }, 1000);
      } else if (state.currentRound === 2) {
        console.log("TEST COMPLETE. IT WORKED.");
        process.exit(0);
      }
    }
  });

}

runTest();
