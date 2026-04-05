export class Questions {
  constructor( questions = [] ) {
    this.questions = questions;
    this.currentIndex = 0;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  getNextQuestion() {
    this.currentIndex++;
    return this.getCurrentQuestion();
  }

  hasMoreQuestions() {
    return this.currentIndex < this.questions.length;
  }

  getTotalQuestions() {
    return this.questions.length;
  }
  
  reset() {
    this.currentIndex = 0;
  }
}
