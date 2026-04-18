export default class QuestionManager {
  constructor() {
    this.questions = new Map();
  }
  add( index, question ) {
    this.questions.set( index, question );
  }
  get( questionId ) {
    return this.questions.get( questionId );
  }
  getAll() {
    return Array.from( this.questions.values() )
  }
  getLength() {
    return this.questions.size
  }
}
