import { Answer } from '../models/Answer.js';

export class AnswerManager {
  constructor( gameInstance ) {
    this.gameInstance = gameInstance;
    this.answers = new Map();
  }

  saveAnswer( playerId, answerData ) {
    const existingAnswer = this.answers.get( playerId );
    if ( existingAnswer ) {
      return existingAnswer;
    }

    const scoreEarned = this.calculateScore({
      answerTime: answerData.responseTime,
      isCorrect: answerData.isCorrect,
      streak: 0
    });

    const answer = new Answer({
      ...answerData,
      playerId,
      scoreEarned,
      createdAt: new Date().toISOString(),
    });

    this.answers.set( playerId, answer );

    return answer;
  }
  
  calculateScore({ answerTime, isCorrect, streak = 0 }) {
    if (!isCorrect) return 0;

    const BASE_POINTS = 100;
    const SPEED_BONUS_MAX = 50;
    const STREAK_WEIGHT = 10; // bonus % per 1 streak (capped)
    const SPEED_DECAY = 8; // if answered in 8s → 0 bonus

    // Time-based bonus: linear decay (fast = max bonus)
    const timeBonus = answerTime > 0
      ? Math.max(0, SPEED_BONUS_MAX * (1 - answerTime / SPEED_DECAY))
      : 0;

    // Streak bonus: e.g., 5% per streak up to 50%
    const streakBonus = Math.min(50, (streak * 5));

    return Math.round(BASE_POINTS + timeBonus + streakBonus);
  }
 
  getPlayerScore(playerId) {
    let total = 0;
    this.answers.forEach(answer => {
      if (answer.playerId === playerId) total += answer.scoreEarned;
    });
    return total;
  }

  getPlayerStreak(playerId) {
    // Simple heuristic: count consecutive correct answers *in current round*
    // Assumes answers are submitted in order — if not, use a separate streak tracker
    let streak = 0;
    for (const answer of this.answers.values()) {
      if (answer.playerId === playerId && answer.isCorrect) {
        streak += 1;
      } else if (answer.playerId === playerId) {
        streak = 0;
      }
    }
    return streak;
  }

  async finalizeResults() {
    const answersToSave = this.getAnswersJSON();

    try {
      // Save to room_answer collection (example — adapt to your DB interface)
      // await this.gameInstance.db.collection('room_answers').insertMany(answersToSave);
      console.log(`✅ Saved ${answersToSave.length} answers for room ${this.gameInstance.room.id}`);
    } catch (err) {
      console.error('Failed to persist answers:', err);
      // You might want to retry or queue — but don’t crash the game
    }

    // Optional: clear in-memory for memory efficiency (after round/game)
    // this.answers.clear();
    
    return answersToSave;
  }
}