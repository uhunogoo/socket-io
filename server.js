import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { initializeSocketHandlers } from './sockets/socketManager.js';
// import { GameState } from './services/GameState.js';
import { Database } from './config/database.js';
import cors from 'cors';
import { GameRoomRegistry } from './services/GameRoomRegistry.js';

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
const db = new Database();
const gameRoomRegistry = new GameRoomRegistry( db );

// Initialize socket handlers
initializeSocketHandlers(io, gameRoomRegistry, db);

server.listen(process.env.PORT || 3001, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 3001}`);
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});
