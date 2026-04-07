export class QuestionManager {
  constructor( gameInstance ) {
    this.gameInstance = gameInstance;
    this.questions = [];
  }

  addQuestions( questions ) {
    const isArray = Array.isArray( questions );
    const questionsArray = isArray ? questions : [ questions ];
    this.questions.push( ...questionsArray );
  }

  getQuestion( index ) {
    return this.questions[ index ] || null;
  }

  getCurrentQuestion() {
    const currentRound = this.gameInstance.getCurrentRound();
    return this.getQuestion( currentRound );
  }

  getNextQuestion() {
    const nextIndex = this.gameInstance.getCurrentRound() + 1;
    return this.getQuestion( nextIndex );
  }

  getQuestionForPlayer() {
    const question = this.getCurrentQuestion();
    return {
      id: question.id,
      title: question.title,
      options: question.options,
    };
  }

  hasMoreQuestions() {
    const currentRound = this.gameInstance.getCurrentRound();
    return currentRound < this.questions.length;
  }

  getTotalQuestions() {
    return this.questions.length;
  }
}
