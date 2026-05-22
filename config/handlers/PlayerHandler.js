import { eq } from 'drizzle-orm';
import { SCHEMA } from '../database.js';

export default class PlayerHandler {
  constructor( db ) {
    this.db = db;
  }

  async upsert( playerData = {} ) {
    const playerSchema = SCHEMA.roomPlayer;
    
    if ( !playerData ) return null;

    const timeNow = new Date();
    const [ player ] = await this.db
      .insert( playerSchema )
      .values({
        ...playerData,
        joinedAt: timeNow,
        lastSeenAt: timeNow,
      })
      .onConflictDoUpdate({
        target: [ 
          playerSchema.roomId,
          playerSchema.playerToken,
        ],
        set: {
          ...playerData,
          lastSeenAt: timeNow,
        },
      })
      .returning();
    
    return player ?? null;
  }

  async remove( playerId ) {
    const playerSchema = SCHEMA.roomPlayer;
    await this.db
      .delete( playerSchema )
      .where( eq( playerSchema.id, playerId ) );
    
    return true;
  }

  async get( playerToken ) {
    const playerSchema = SCHEMA.roomPlayer;
    const player = await this.db
      .select()
      .from( playerSchema )
      .where( eq( playerSchema.playerToken, playerToken ) )
      .limit( 1 );
    
    if (!player.length) return null;
    
    return player[0];
  }

  async getAll( roomToken ) {
    const playerSchema = SCHEMA.roomPlayer;
    const players = await this.db
      .select()
      .from( playerSchema )
      .where( eq( playerSchema.roomId, roomToken ) );
    
    return players;
  }
}