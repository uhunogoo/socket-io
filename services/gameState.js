import { Room } from '../models/Room.js';
import { PlayerService } from './playerService.js';

export class GameState {
  constructor() {
    this.rooms = new Map();
    this.activeGames = new Map();
    this.playerService = new Map();
  }

  async init( db ) {
    // Load all rooms from database
    const rooms = await db.getAllDbActiveRooms();
    for (const roomData of rooms) {
      this.createRoom(roomData);
    }
  }

  createRoom( roomData, { force = false } = {} ) {
    const existingRoom = this.rooms.get(roomData.id);
    
    if (existingRoom && !force) {
      if ( roomData.maxPlayers !== existingRoom.maxPlayers ) {
        existingRoom.maxPlayers = roomData.maxPlayers;
      }

      return existingRoom;
    }

    // Create new room only if it doesn't exist or force
    const room = new Room( roomData );
    this.rooms.set(room.id, room);

    // Create player service for this room
    if (!this.playerService.has(room.id)) {
      const playerService = new PlayerService();
      this.playerService.set(room.id, playerService);
    }

    return room;
  }

  getPlayerService(roomId) {
    return this.playerService.get( roomId );
  }

  getRoom(roomId) {
    return this.rooms.get( roomId );
  }

  startGame(roomId) {
    const room = this.getRoom( roomId );
    if (room) {
      room.status = 'lobby';
      return true;
    }
    return false;
  }

  isGameOver(roomId) {
    const room = this.getRoom(roomId);
    return room ? room.isGameOver() : true;
  }
}