import 'dotenv/config';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const TABLES = {
  ROOMS: 'room',
  ROOM_PLAYERS: 'room_player',
  ANSWERS: 'room_answer',
};

export class Database {
  constructor() {
    this.db = db;
  }

  async getAllInitialData() {
    try {
      const initialData = await this.db.batch([
        {
          sql: `
            SELECT * 
            FROM ${ TABLES.ROOMS }
          `,
          args: []
        },
        {
          sql: `
            SELECT * 
            FROM ${ TABLES.ROOM_PLAYERS }
          `,
          args: []
        },
        {
          sql: `
            SELECT * 
            FROM ${ TABLES.ANSWERS }
          `,
          args: []
        },
      ]);
  
      return { 
        rooms: initialData[0].rows,
        players: initialData[1].rows,
        answers: initialData[2].rows
      };
    } catch (error) {
      console.error('Error getting all initial data:', error);
      throw error;
    }
  }

  async getAllRoomData( roomId ) {
    try {
      const roomData = await this.db.batch([
        {
          sql: `
            SELECT * 
            FROM ${ TABLES.ROOM_PLAYERS }
            WHERE roomId = ?
          `,
          args: [ roomId ]
        },
        {
          sql: `
            SELECT * 
            FROM ${ TABLES.ANSWERS }
            WHERE roomId = ?
          `,
          args: [ roomId ]
        },
      ]);
      
      return {
        players: roomData[0].rows,
        answers: roomData[1].rows
      };
    } catch (error) {
      console.error('Error getting all room data:', error);
      throw error;
    }
  }

  async getRoomById( roomId ) {
    const result = await this.db.execute({
      sql: `
        SELECT * 
        FROM ${ TABLES.ROOMS }
        WHERE id = ?
      `,
      args: [ roomId ]
    });
  
    return result.rows[0];
  }

  async getPlayerByToken( playerToken ) {
    const result = await this.db.execute({
      sql: `
        SELECT * 
        FROM ${ TABLES.ROOM_PLAYERS }
        WHERE playerToken = ?
      `,
      args: [ playerToken ]
    });
  
    return result.rows[0];
  }

  async updatePlayer( playerToken, updateData ) {
    const result = await this.db.execute({
      sql: `
        UPDATE ${ TABLES.ROOM_PLAYERS }
        SET ${ Object.keys(updateData).map(key => `${key} = ?`).join(', ') }
        WHERE playerToken = ?
      `,
      args: [ ...Object.values(updateData), playerToken ]
    });
  
    return result.rows[0];
  }

  async batch( batch = [] ) {
    if ( !Array.isArray( batch ) || batch.length === 0 ) {
      return { success: false, message: 'No data to insert' };
    }

    try {

      const result = await this.db.batch( batch );
      
      return {
        success: true,
        message: 'Data inserted successfully',
        data: result
      };

    } catch (error) {
      console.error('Error inserting data:', error);
      throw error;
    }
  }

  async getAllRooms() {
    const result = await this.db.execute({
      sql: `
        SELECT * 
        FROM ${ TABLES.ROOMS }
      `,
      args: []
    });
  
    return result.rows;
  }
}
