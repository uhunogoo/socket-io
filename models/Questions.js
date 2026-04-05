export class Questions {
  constructor( questions = [] ) {
    this.questions = questions;
    this.currentIndex = 0;
  }

  getCurrentQuestion() {
    return this.currentIndex < this.questions.length 
      ? this.questions[this.currentIndex] 
      : null;
  }
 
  getNextQuestion() {
    if (!this.hasNextQuestion()) return null;
    this.currentIndex++;
    return this.getCurrentQuestion();
  }
 
  setRoundIndex(roundIndex) {
    // Ensure valid round index
    if (roundIndex < 0 || roundIndex >= this.questions.length) {
      console.warn(`[Questions] Invalid roundIndex ${roundIndex}, max: ${this.questions.length - 1}`);
      this.currentIndex = Math.max(0, Math.min(roundIndex, this.questions.length - 1));
    } else {
      this.currentIndex = roundIndex;
    }
  }

  hasNextQuestion() {
    return this.currentIndex < this.questions.length - 1;
  }
 
  reset() {
    this.currentIndex = 0;
  }
 
  isComplete() {
    return this.currentIndex >= this.questions.length;
  }

  getAllQuestions() {
    return [...this.questions];
  }
  
  isActiveRound(roundIndex) {
    return roundIndex === this.currentIndex;
  }

  getTotalRounds() {
    return this.questions.length;
  }
}