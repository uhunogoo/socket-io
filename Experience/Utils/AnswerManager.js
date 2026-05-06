export default class AnswerManager {
  #SCORE_THRESHOLD = 0.1;

  constructor( game ) {
    this.game = game;
    this.answersHistory = new Map();
    this.tempAnswers = new Map();
  }

  createAnswerRecord( playerToken, answerData, overrides = {} ) {
    const submittedAt = Date.now();
    const roundData = this.game.getCurrentRound();
    const playerStreak = this.getPlayerStreak( playerToken );
    const nextStreak = answerData.isCorrect ? playerStreak + 1 : 0;

    // Calculate score
    let score = 0;
    console.log(answerData.isCorrect);
    if ( answerData.isCorrect && roundData ) {
      const timeTaken = Math.max( 0, submittedAt - (roundData.roundStartedAt || 0) );
      const timeRatio = Math.min( timeTaken / this.game.timeToAnswer, 1 );
      const timeBonus = Math.max( this.#SCORE_THRESHOLD, 1 - timeRatio );
      score = Math.round( timeBonus * this.game.maxScore );
    }

    return {
      playerToken,
      answerId: answerData.index,
      isCorrect: answerData.isCorrect,
      responseTime: answerData.responseTime ?? this.game.timeToAnswer,
      answerStreak: nextStreak,
      scoreEarned: score,
      createdAt: submittedAt,
      ...overrides,
    };
  }

  add( playerToken, answerData ) {
    console.log('add: ', playerToken, answerData, this.game);
    if ( !answerData || !playerToken ) return;

    // Create answer
    console.log('add: ',answerData);
    const answer = this.createAnswerRecord( playerToken, answerData );

    // Store the answer with calculated score
    this.tempAnswers.set( playerToken, answer );
  }

  flushRound() {
    if (this.tempAnswers.size === 0) return [];

    const batchData = [];
    const roundIndex = this.game.currentRound;
    const roomId = this.game.room.id;

    // Convert Map to Array of Objects matching your Schema
    for ( const [ playerToken, data ] of this.tempAnswers.entries() ) {
      const record = {
        id: crypto.randomUUID(),
        roomId: roomId,
        playerToken: playerToken,
        ...data,
      };

      batchData.push( record );
    }

    // Save to History and clear temporary memory
    this.answersHistory.set( roundIndex, batchData );
    this.tempAnswers.clear();

    // Return data
    return batchData;
  }

  addMissingAnswers() {
    const currentRound = this.game.getCurrentRound();
    if ( !currentRound ) return;

    const players = this.game.players.getAll();
    for ( const player of players ) {
      const playerToken = player.playerToken;
      if ( this.tempAnswers.has( playerToken ) ) continue;

      const answer = this.createAnswerRecord( playerToken, {
        index: -1,
        isCorrect: false,
        responseTime: this.game.timeToAnswer,
      } );

      this.tempAnswers.set( playerToken, answer );
    }
  }

  getPlayerStreak( playerToken ) {
    // Get last round's answer from history
    const previousRoundIndex = this.game.currentRound - 1;
    const previousAnswers = this.answersHistory.get( previousRoundIndex );
    
    if ( !previousAnswers ) return 0;
    
    const playerAnswer = previousAnswers.find( a => a.playerToken === playerToken );
    return playerAnswer?.answerStreak ?? 0;
  }

  get( roundIndex ) {
    return this.answersHistory.get( roundIndex ) || [];
  }

  getByplayerToken( playerToken ) {
    return this.tempAnswers.get( playerToken ) || null;
  }

  getCurrentRoundAnswers() {
    return Array.from( this.tempAnswers.values() );
  }
  
  destroy() {
    // this.answersHistory.clear(); // Keep for debugging/analysis
    this.tempAnswers.clear();
  }
}

