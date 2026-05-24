export default class HandleAnswer {
  constructor( experience ) {
    this.experience = experience;
  }

  addAnswer({ roomPin, playerToken, questionType, answer }) {
    const game = this.experience.games.get( roomPin );
    const isPlaying = game?.status === 'playing';
    if ( !game || !isPlaying ) return;

    // Check if player has already answered
    const existingAnswer = game.answers.getByplayerToken( playerToken );
    if ( existingAnswer ) return;

    // Check question and answer
    const question = game.quiz.questions[ game.currentRound ];
    if ( !question || !answer ) return;

    let isCorrect = false;
    if ( questionType === 'single' ) {
      isCorrect = question.correctAnswerIndex === answer.index;
    } else if ( questionType === 'sequence' ) {
      const correctSequence = [...question.correctSequence].join(',');
      const currentAnswer = [...answer].join(',');
      
      isCorrect = correctSequence === currentAnswer;
    }
    
    const answerData = { index: game.currentRound, isCorrect };
    console.log( 'handle: ', answerData );

    // Add the answer
    game.answers.add( playerToken, answerData );
  }
}
