export class Questions {
  constructor( questions = [] ) {
    this.questions = questions;
    this.currentIndex = 0;
  }

  getCurrentQuestion() {
    if (this.currentIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentIndex];
  }

  getNextQuestion() {
    this.currentIndex++;
    return this.getCurrentQuestion();
  }

  hasNextQuestion() {
    return this.currentIndex < this.questions.length - 1;
  }

  getTotalQuestions() {
    return this.questions.length;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getQuestionByIndex(index) {
    if (index < 0 || index >= this.questions.length) {
      return null;
    }
    return this.questions[index];
  }

  reset() {
    this.currentIndex = 0;
  }

  isComplete() {
    return this.currentIndex >= this.questions.length;
  }

  toObject() {
    return {
      questions: this.questions,
      currentIndex: this.currentIndex,
      currentQuestion: this.getCurrentQuestion(),
      totalQuestions: this.getTotalQuestions(),
      isComplete: this.isComplete()
    };
  }
}