export default class HandleAnswer {
  constructor( experience ) {
    this.experience = experience;
  }

  addAnswer({ roomId, playerId, index }) {
    const game = this.experience.games.get( roomId );
    const isPlaying = game?.status === 'playing';
    console.log(0);
    if ( !game || !isPlaying ) return;

    // Check if player has already answered
    const existingAnswer = game.answers.getByPlayerId( playerId );
    console.log(1);
    if ( existingAnswer ) return;

    // Check if answer is correct
    const question = game.questions.get( game.currentRound );
    console.log(2);
    if ( !question ) return;
    const isCorrect = question.correctAnswer === index;

    // Add the answer
    console.log(3);
    
    game.answers.add( playerId, { index, isCorrect } );
  }
}
