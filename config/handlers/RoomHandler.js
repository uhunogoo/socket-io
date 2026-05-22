import { eq } from 'drizzle-orm';
import { SCHEMA } from '../database.js';



export default class RoomHandler {
  constructor( db ) {
    this.db = db;
  }

  async add( roomData ) {
    const roomSchema = SCHEMA.room;
    
    await this.db
      .insert( roomSchema )
      .values( roomData )
      .onConflictDoNothing({
        target: roomSchema.id,
      });

    return roomData;
  }

  async get( roomId ) {
    const roomSchema = SCHEMA.room;
    const room = await this.db.select().from( roomSchema ).where( eq( roomSchema.id, roomId ) ).limit( 1 );

    if ( !room.length ) return null;

    return room[0];
  }

  async getByPin( pin ) {
    const roomSchema = SCHEMA.room;
    const room = await this.db.select().from( roomSchema ).where( eq( roomSchema.pin, pin ) ).limit( 1 );

    if ( !room.length ) return null;

    return room[0];
  }

  async getAll() {
    const roomSchema = SCHEMA.room;
    const rooms = await this.db.select().from( roomSchema );
    return rooms;
  }
}
