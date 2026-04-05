export class Room {
  constructor( roomData = {} ) {
    this.id = roomData.id;
    this.pin = roomData.pin;
    this.hostId = roomData.hostId;
    this.quizId = roomData.quizId;
    this.currentRoundIndex = 0;
    this.maxPlayers = roomData.maxPlayers || 50;
    this.status = roomData.status || 'lobby';
    this.currentQuestionId = roomData.currentQuestionId || 0;
    this.timeToAnswer = roomData.timeToAnswer || 30;
  }

  setStatus( status ) {
    this.status = status;
  }
}