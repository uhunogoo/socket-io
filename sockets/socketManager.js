// Handlers
import { handleHostConnect } from './handlers/hostHandlers.js';
import { handleJoinRoom } from './handlers/playerHandlers.js';
import { handleStartRound, handleSubmitAnswer } from './handlers/gameHandlers.js';
import { handleDisconnect } from './handlers/disconnectHandler.js';

export const initializeSocketHandlers = (io, gameRoomRegistry, db) => {  
  io.on('connection', (socket) => {
    console.log('🔌 Підключено:', socket.id);

    // Register handlers
    socket.on('host-connect', handleHostConnect( io, socket, gameRoomRegistry, db ));
    socket.on('join-room', handleJoinRoom( io, socket, gameRoomRegistry, db ));

    socket.on('start-round', handleStartRound(io, socket, gameRoomRegistry, db));
    // socket.on('submit-answer', handleSubmitAnswer(io, socket, gameState, gameService, db));

    socket.on('disconnect', handleDisconnect( io, socket, gameRoomRegistry, db));
  });
};