export class RoundManager {
  constructor( gameInstance ) {
    this.gameInstance = gameInstance;
    this.isRoundActive = false;
    this.timer = null;
    this.answers = new Map();
  }
  
  startRound() {
    if ( this.isRoundActive ) {
      throw new Error( 'Round is already active' );
    }
    
    this.isRoundActive = true;
    this.answers.clear();

    return {
      round: this.gameInstance.getCurrentRound(),
      status: 'playing',
      question: this.gameInstance.questionManager.getCurrentQuestion(),
    };
  }

  endRound() {
    if ( !this.isRoundActive ) return;

    this.timer = null;
    this.isRoundActive = false;

    // const roundResults = this.calculateRoundResults();
    
    // this.gameInstance.scoreManager.updateScores( roundResults );
    this.gameInstance.currentRound++;

    // Cleanup
    this.answers.clear();

    // return roundResults;
    return {};
  }

  submitAnswer( playerToken, answerData ) {
    if ( !this.isRoundActive ) {
      throw new Error( 'Round is not active' );
    }
  
    this.answers.set( playerToken, answerData );
  }

  getAnswers() {
    return this.answers;
  }

  calculateRoundResults() {
    const answers = this.answers;
    const currentQuestion = this.gameInstance.questionManager.getCurrentQuestion();
    const correctAnswer = currentQuestion.correctAnswer;
    const roundScore = new Map();

    // Example scoring: 100 pts per correct answer
    answers.forEach( ( answer, playerToken ) => {
      const playerScore = answer === correctAnswer ? 100 : 0;
      roundScore.set( playerToken, playerScore );
    });

    return {
      round: this.gameInstance.currentRound,
      roundScore,
      totalAnswers: answers.size,
    };
  }

  destroy() {
    clearTimeout( this.timer );
    this.timer = null;
    this.answers.clear();
    this.isRoundActive = false;
  }
}
