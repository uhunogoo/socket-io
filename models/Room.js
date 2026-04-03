export class Room {
  constructor( roomData = {} ) {
    this.id = roomData.id;
    this.pin = roomData.pin;
    this.hostId = roomData.hostId;
    this.quizId = roomData.quizId;
    this.maxPlayers = roomData.maxPlayers || 50;
    this.status = roomData.status || 'lobby';
    this.currentQuestionId = roomData.currentQuestionId || 0;
    this.timeToAnswer = roomData.timeToAnswer || 30;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    return this;
  }

  nextQuestion() {
    this.currentQuestionId++;
    return this;
  }
  
  checkRoomStatus( status ) {
    return this.status === status;
  }

  roomInfo() {
    return {
      id: this.id,
      pin: this.pin,
      hostId: this.hostId,
      quizId: this.quizId,
      maxPlayers: this.maxPlayers,
      status: this.status,
      currentQuestionId: this.currentQuestionId,
      timeToAnswer: this.timeToAnswer,
    };
  }
}