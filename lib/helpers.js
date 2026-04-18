export function syncRoomPlayers(io, roomId) {
  const connectedSockets = io.sockets.adapter.rooms.get(roomId) ?? new Set();
  console.log('Connected sockets:', connectedSockets);
  
  // Get active players token
  const activeTokens = [];
  for (const socketId of connectedSockets) {
    const s = io.sockets.sockets.get(socketId);
    if (s?.playerToken) {
      activeTokens.push(s.playerToken);
    }
  }
  
  // await resetPlayersOnline(roomId, activeTokens);
  console.log(`🔄 Sync: ${ roomId } → ${ activeTokens.length } online`);
  
  return activeTokens;
}

export function copyObject(obj) {
  return JSON.parse( JSON.stringify( obj ) );
}