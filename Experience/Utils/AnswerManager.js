// Schema for answer table
// {
//   id: text( 'id' ).primaryKey(),
//   roomId: text( 'roomId' ).notNull().references(() => rooms.id, { onDelete: 'cascade' }),
//   playerId: text( 'playerId' ).notNull().references(() => roomPlayers.id, { onDelete: 'cascade' }),
//   questionId: text( 'questionId' ).notNull(), // Question ID from Sanity
//   answerId: integer( 'answerId' ).notNull(),
//   isCorrect: integer( 'isCorrect', { mode: 'boolean' } ).notNull(),
//   responseTime: integer( 'responseTime' ).notNull(), // time to answer in ms
//   scoreEarned: integer( 'scoreEarned' ).default(0).notNull(),
//   createdAt: integer( 'createdAt', { mode: 'timestamp' } ).notNull(),
// }

export default class AnswerManager {
  #SCORE_THRESHOLD = 0.1;

  constructor( game ) {
    this.game = game;
    this.answersHistory = new Map();
    this.tempAnswers = new Map();
  }

  add( playerId, answerData ) {
    if (!answerData || !this.game) return;

    const submittedAt = Date.now();
    const currentRound = this.game.getCurrentRound();
    
    if (!currentRound) return;

    // Calculate metrics
    const timeTaken = Math.max(0, submittedAt - (currentRound.roundStartedAt || 0));
    let score = 0;
    
    // Calculate score (in-Memory)
    if (answerData.isCorrect) {
      const timeRatio = Math.min(timeTaken / this.game.timeToAnswer, 1);
      const timeBonus = Math.max(this.#SCORE_THRESHOLD, 1 - timeRatio);
      score = Math.round(timeBonus * this.game.maxScore);
    }

    // Store the answer with calculated score
    this.tempAnswers.set( playerId, {
      playerId,
      questionId: currentRound.questionId,
      answerId: answerData.index,
      isCorrect: answerData.isCorrect,
      responseTime: timeTaken,
      scoreEarned: score,
      createdAt: submittedAt,
    } );
  }

  flushRound() {
    if (this.tempAnswers.size === 0) return [];

    const batchData = [];
    const roundIndex = this.game.currentRound;
    const roomId = this.game.room.id;

    // Convert Map to Array of Objects matching your Schema
    for (const [playerId, data] of this.tempAnswers.entries()) {
      const record = {
        id: crypto.randomUUID(),
        roomId,
        playerId: playerId,
        questionId: data.questionId,
        answerId: data.answerId,
        isCorrect: data.isCorrect,
        responseTime: data.responseTime,
        scoreEarned: data.scoreEarned,
        createdAt: new Date(data.createdAt), // Ensure Date object for DB
      };
      batchData.push( record );
    }

    // Save to History
    this.answersHistory.set( roundIndex, batchData );

    // Clear Temporary Memory
    this.tempAnswers.clear();

    // Return data
    return batchData;
  }

  addMissingAnswers() {
    const currentRound = this.game.getCurrentRound();
    if (!currentRound) return;

    const players = this.game.players.getAll();
    for ( const player of players ) {
      const playerId = player.playerToken;
      if ( this.tempAnswers.has( playerId ) ) continue;

      this.tempAnswers.set( playerId, {
        playerId,
        questionId: currentRound.questionId,
        answerId: -1,
        isCorrect: false,
        responseTime: this.game.timeToAnswer,
        scoreEarned: 0,
        createdAt: Date.now(),
      } );
    }
  }

  get( roundIndex ) {
    return this.answersHistory.get( roundIndex ) || [];
  }

  getByPlayerId( playerId ) {
    return this.tempAnswers.get( playerId ) || null;
  }

  getCurrentRoundAnswers() {
    return Array.from( this.tempAnswers.values() );
  }
  
  destroy() {
    // this.answersHistory.clear(); // Keep for debugging/analysis
    this.tempAnswers.clear();
  }
}
