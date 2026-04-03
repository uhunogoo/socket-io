export class Players {
  constructor( playerData = {} ) {
    this.id = playerData.id;
    this.playerToken = playerData.playerToken;
    this.nickname = playerData.nickname;
    this.score = playerData.score || 0;
    this.streak = playerData.streak || 0;
    this.isConnected = playerData.isConnected !== undefined ? playerData.isConnected : 1; // 1 = connected, 0 = disconnected
    this.lastSeenAt = playerData.lastSeenAt || Date.now();
  }

  updateScore(newScore) {
    this.score = newScore;
    return this;
  }

  incrementScore(points = 1) {
    this.score += points;
    return this;
  }

  updateStreak(newStreak) {
    this.streak = newStreak;
    return this;
  }

  incrementStreak() {
    this.streak += 1;
    return this;
  }

  resetStreak() {
    this.streak = 0;
    return this;
  }

  setConnected( connected = 1 ) {
    this.isConnected = connected;
    this.lastSeenAt = Date.now();
    return this;
  }

  toObject() {
    return {
      id: this.id,
      playerToken: this.playerToken,
      nickname: this.nickname,
      score: this.score,
      streak: this.streak,
      isConnected: this.isConnected,
      lastSeenAt: this.lastSeenAt,
    };
  }
}