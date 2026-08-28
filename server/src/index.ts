// ============================================
// IMPOSTOR GAME — Server Entry Point
// ============================================
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameManager } from './game/GameManager';
import { registerSocketHandlers } from './socket/handlers';
import { WordEngine } from './game/WordEngine';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do build do client (produção)
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Inicializar game manager
const gameManager = new GameManager();

// Registrar handlers do Socket.io
registerSocketHandlers(io, gameManager);

// ─── REST API ─────────────────────────

import { themes } from '../../shared/themes';

// Lista de temas
app.get('/api/themes', (_req, res) => {
  res.json(themes.map(t => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    is18Plus: t.is18Plus,
    groupCount: t.pairs.easy.length
  })));
});

// Status do server
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    rooms: gameManager.listRooms(),
    uptime: process.uptime(),
  });
});

// SPA fallback (produção)
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// ─── Graceful Shutdown ─────────────────────────

process.on('SIGINT', () => {
  console.log('\n[Server] Desligando...');
  gameManager.shutdown();
  httpServer.close(() => {
    console.log('[Server] Encerrado.');
    process.exit(0);
  });
});

// ─── Start ─────────────────────────

httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║    🎭 IMPOSTOR GAME SERVER             ║
║    Rodando em http://localhost:${PORT}    ║
╚══════════════════════════════════════════╝
  `);
});


