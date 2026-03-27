import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import {
  getPlayerOnline,
  getRoom,
  updatePlayerOnline,
} from './lib/turso.js';

// Const
const PORT = process.env.PORT || 3001;

// Temporary data
const hostSockets = new Map();
const roundTimers = new Map();
const roundAnswers = new Map();
const roomQuestions = new Map();

// Init
const app = express();
app.use(cors());
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // TODO: add allowed for security
    methods: ['GET', 'POST'],
  },
});

// Security
io.use((socket, next) => {
  const auth = socket.handshake.auth.token;
  if (auth === process.env.AUTH_TOKEN) {
    return next();
  }

  console.log(`🚫 Відмовлено в доступі для: ${socket.id}`);
  return next(new Error('Authentication error: Invalid Token'));
});

// Game
io.on('connection', (socket) => {
  console.log('🔌 Підключено:', socket.id);

  // Host room
  socket.on('host-connect', async ({ roomId, playerToken, questions }) => {
    const room = await getRoom( roomId, playerToken );
    if ( !room?.rows?.length ) {
      return socket.emit('error', { message: 'Room not found' });
    }
    
    socket.join( roomId );
    socket.roomId = roomId;
    hostSockets.set( roomId, socket.id );
    
    // Questions 
    if ( questions?.length && !roomQuestions.has( roomId ) ) {
      roomQuestions.set( roomId, questions );
    }

    const players = await getPlayerOnline( roomId );
    socket.emit('players-update', { players });
  });

  // 1. Join the room
  socket.on('join-room', async ({ roomId, playerToken }) => {
    socket.join(roomId);
    socket.playerToken = playerToken;
    socket.roomId = roomId;

    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size ?? 0;
    const room = await getRoom( roomId, playerToken );
    
    if (roomSize >= room.maxPlayers) {
      return socket.emit('error', { message: 'Кімната переповнена', code: 403 });
    }
    
    await updatePlayerOnline( playerToken, 1 );
    const players = await getPlayerOnline( roomId );
    
    io.to(roomId).emit('players-update', { players });
  });

  // 3. Start round            → 'start-round'      (або автоматично після 'start-game')
  // 4. Player answers         → 'submit-answer'
  // 5. End round              → авто (таймер) або 'next-round' від хоста
  // 6. End game               → авто після останнього раунду

  // 7. Disconnect / cleanup   → 'disconnect'
  socket.on('disconnect', async () => {
    const { playerToken, roomId } = socket;

    // Check if the socket actually had a player assigned
    if (playerToken && roomId) {
      // 1. Set them to offline (0)
      await updatePlayerOnline(playerToken, 0);

      // 2. Get the updated list (which now excludes/marks them offline)
      const players = await getPlayerOnline(roomId);

      // 3. Tell everyone else in the room
      io.to(roomId).emit('players-update', { players });

      console.log(
        `Player ${playerToken} disconnected from room ${roomId}`
      );
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Real-time bus running on port ${PORT}`);
});

// Ping-pong endpoint for Render server
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});
