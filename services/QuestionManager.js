export class QuestionManager {
  constructor( gameInstance ) {
    this.gameInstance = gameInstance;
    this.questions = [];
  }

  mapQuestion( question ) {
    if (!question) return null;

    const newQuestion = {
      key: question._key,
      type: question._type,
      correctAnswerIndex: question.correctAnswerIndex,
    }

    return newQuestion;
  }

  addQuestions( questions ) {
    const isArray = Array.isArray( questions );
    const questionsArray = isArray ? questions : [ questions ];
    const mappedQuestions = questionsArray.map( 
      question => this.mapQuestion( question ) 
    );
    
    this.questions.push( ...mappedQuestions );
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
    if (!question) return {};

    return {
      id: question.key,
      type: question.type,
      correctAnswerIndex: question.correctAnswerIndex,
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

