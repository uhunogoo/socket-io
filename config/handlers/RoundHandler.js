import { SCHEMA } from '../database.js';
import { and, eq } from "drizzle-orm";

export default class RoundHandler {
  constructor( db ) {
    this.db = db;
  }

  async add( roundData ) {
    const roundSchema = SCHEMA.roomRound;
    
    const timeNow = new Date();
    const payload = {
      ...roundData,
      createdAt: timeNow,
    };

    const result = await this.db
      .insert( roundSchema )
      .values( payload )
      .onConflictDoNothing({
        target: [ roundSchema.roomId, roundSchema.roundNumber ],
      }).returning();
    
    return result;
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