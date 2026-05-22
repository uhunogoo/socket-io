import { SCHEMA } from '../database.js';

export default class RoundHandler {
  constructor( db ) {
    this.db = db;
  }

  async add( roomCode, roundId, roundData ) {
    const roomSchema = SCHEMA.room;
    const roundSchema = SCHEMA.roomRound;
    
    const timeNow = new Date();
    const payload = {
      ...roundData,
      createdAt: timeNow,
    };

    const result = await this.db
      .insert( roomSchema )
      .values( payload )
      .onConflictDoNothing({
        target: [ roundSchema.roomId, roundSchema.roundNumber ],
      }).returning();
    
    return result;
  }

  async update( roomId, roundNumber, roundData ) {
    const roundSchema = SCHEMA.roomRound;

    const timeNow = new Date();

    const result = await this.db
      .update( roundSchema )
      .set({
        ...roundData,
        updatedAt: timeNow,
      })
      .where(
        and(
          eq( roundSchema.roomId, roomId ),
          eq( roundSchema.roundNumber, roundNumber ),
        )
      )
      .returning();

    if ( !result.length ) return null;

    return result[0];
  }

   async get( roomId, roundNumber ) {
    const roundSchema = SCHEMA.roomRound;

    const result = await this.db
      .select()
      .from( roundSchema )
      .where(
        and(
          eq( roundSchema.roomId, roomId ),
          eq( roundSchema.roundNumber, roundNumber ),
        )
      )
      .limit( 1 );

    if ( !result.length ) return null;

    return result[0];
  }
}