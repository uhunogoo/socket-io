import 'dotenv/config';
import { createClient } from '@libsql/client';
import { getAllActiveRooms, getPlayerByToken, getRoomFromDB, syncAndGetPlayers, updatePlayerOnline, getPlayerOnline, updateRoomStatus } from '../lib/turso.js';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export class Database {
  constructor() {
    this.db = db;
  }
  
  getDb() {
    return this.db;
  }

  async getRoom( roomId, playerToken ) {
    return await getRoomFromDB( this.db, roomId, playerToken );
  }

  async getAllDbActiveRooms() {
    return await getAllActiveRooms( this.db );
  }

  async updateDbRoomStatus( roomId, status ) {
    return await updateRoomStatus( this.db, roomId, status );
  }

  async getPlayers( roomId ) {
    return await getPlayerOnline( this.db, roomId );
  }

  async getDbPlayerByToken( playerToken ) {
    return await getPlayerByToken( this.db, playerToken );
  }

  async updateDbPlayerOnline( playerToken, isOnline ) {
    try {
      await updatePlayerOnline( this.db, playerToken, isOnline );
      console.log(`✅ Player ${playerToken} logged in & DB online status set`);
    } catch (dbErr) {
      console.warn(`⚠️ DB update failed, but player joined:`, dbErr);
    }
  }

  async syncDbAndGetPlayers( roomId, activeTokens = [] ) {
    return await syncAndGetPlayers( this.db, roomId, activeTokens );
  }
}
