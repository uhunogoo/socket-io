export class Answer {
  constructor( answer ) {
    this.playerId = answer.playerId;
    this.questionId = answer.questionId;
    this.answerId = answer.answerId;
    this.isCorrect = answer.isCorrect;
    this.responseTime = answer.responseTime;
    this.scoreEarned = answer.scoreEarned;
    this.createdAt = answer.createdAt;
  }

  toJSON() {
    return {
      playerId: this.playerId,
      questionId: this.questionId,
      answerId: this.answerId,
      isCorrect: this.isCorrect,
      responseTime: this.responseTime,
      scoreEarned: this.scoreEarned,
      createdAt: this.createdAt,
    };
  }
}
