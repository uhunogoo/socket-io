// This is the schema for the player table
// {
//   id: text( 'id' ).primaryKey(), 
//   roomId: text( 'roomId' ).notNull().references( () => rooms.id, { onDelete: 'cascade' } ),
//   playerToken: text('playerToken').notNull(),
//   nickname: text( 'nickname', { length: 100 } ).notNull(),
//   score: integer( 'score' ).default( 0 ).notNull(),
//   streak: integer( 'streak' ).default( 0 ).notNull(),
//   joinedAt: integer( 'joinedAt', { mode: 'timestamp' } ).notNull(),
//   isConnected: integer('isConnected', { mode: 'boolean' }).default(true).notNull(),
//   lastSeenAt: integer('lastSeenAt', { mode: 'timestamp' }),
// }

export class Player {
  constructor( playerData = {} ) {
    this.id = playerData.id;
    this.roomId = playerData.roomId;
    this.playerToken = playerData.playerToken;
    this.nickname = playerData.nickname;
    this.score = playerData.score ?? 0;
    this.streak = playerData.streak ?? 0;
    this.isConnected = playerData.isConnected ?? true;
    this.lastSeenAt = playerData.lastSeenAt ?? Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      nickname: this.nickname,
      roomId: this.roomId,
      playerToken: this.playerToken,
      score: this.score,
      streak: this.streak,
      isConnected: this.isConnected,
    };
  }
}