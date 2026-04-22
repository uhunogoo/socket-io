export default class QuestionManager {
  constructor() {
    this.questions = new Map();
  }
  add( index, question ) {
    this.questions.set( index, question );
  }
  get( questionId ) {
    const question = this.questions.get( questionId );
    return question;
  }
  getAll() {
    return Array.from( this.questions.values() )
  }
  getLength() {
    return this.questions.size
  }
}
