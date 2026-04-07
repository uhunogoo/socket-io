// utils/socketUtils.js
export const SocketUtils = {
  emitToRoom(io, roomId, event, data) {
    io.to(roomId).emit(event, data);
  },

  emitToPlayer(io, playerToken, event, data) {
    // Find socket by playerToken and emit
    const sockets = io.sockets.sockets;
    for (const socket of sockets.values()) {
      if (socket.playerToken === playerToken) {
        socket.emit(event, data);
        return true;
      }
    }
    return false;
  },

  broadcastPlayerUpdate(io, roomId, playerService) {
    const players = playerService.getAllPlayers();
    io.to(roomId).emit('players-update', { players });
  },

  cleanupSocket(socket) {
    if (socket.roomId) {
      socket.leave(socket.roomId);
      delete socket.roomId;
      delete socket.playerToken;
      delete socket.isHost;
    }
  }
};