export default class HandleAnswer {
  constructor( experience ) {
    this.experience = experience;
  }

  addAnswer({ roomId, playerId, index }) {
    const game = this.experience.games.get( roomId );
    const isPlaying = game?.status === 'playing';
    if ( !game || !isPlaying ) return;

    // Check if player has already answered
    const existingAnswer = game.answers.getByPlayerId( playerId );
    if ( existingAnswer ) return;

    // Check if answer is correct
    const question = game.questions.get( game.currentRound );
    if ( !question ) return;
    
    // Add the answer
    const isCorrect = question.correctAnswerIndex === index;
    game.answers.add( playerId, { index, isCorrect } );
  }
}
