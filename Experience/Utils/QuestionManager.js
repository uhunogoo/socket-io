export default class QuestionManager {
  constructor() {
    this.questions = new Map();
  }
  add( question ) {
    this.questions.set( question.id, question );
  }
  get( questionId ) {
    return this.questions.get( questionId );
  }
  getAll() {
    return Array.from( this.questions.values() );
  }
}
