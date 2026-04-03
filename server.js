import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { initializeSocketHandlers } from './sockets/socketManager.js';
import { GameState } from './services/gameState.js';
import { Database } from './config/database.js';
import cors from 'cors';

const app = express();
app.use(cors());
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // TODO: add allowed for security
    methods: ['GET', 'POST'],
  },
});

// Initialize services
const gameState = new GameState();
const db = new Database();

await gameState.init( db );

// Initialize socket handlers
initializeSocketHandlers(io, gameState, db);

server.listen(process.env.PORT || 3001, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 3001}`);
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});
