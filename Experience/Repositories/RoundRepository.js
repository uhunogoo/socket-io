export default class RoundRepository {
  constructor( db ) {
    this.db = db;
  }

  async saveRound( batchAnswers, updatedPlayers ) {
    const batch = [];
  
    // Answer inserts
    batch.push( ...batchAnswers.map( ans => ( {
      sql: `
        INSERT INTO ${ TABLES.ANSWERS } (
          id, roomId, playerId, answerId,
          isCorrect, responseTime, answerStreak, scoreEarned, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        ans.id, ans.roomId, ans.playerId, ans.answerId,
        ans.isCorrect ? 1 : 0, ans.responseTime,
        ans.answerStreak ?? 0, ans.scoreEarned ?? 0,
        Math.floor( ans.createdAt / 1000 )
      ]
    } ) ) );
  
    // Player score/streak updates
    batch.push( ...updatedPlayers.map( p => ( {
      sql: `
        UPDATE ${ TABLES.ROOM_PLAYERS }
        SET score = ?, streak = ?
        WHERE playerToken = ?
      `,
      args: [ p.totalScore, p.streak, p.playerToken ]
    } ) ) );
  
    return await this.db.batch( batch );
  }
}