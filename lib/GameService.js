// Event constants for consistency
const EVENTS = {
  ROUND_STARTED: 'round-started',
  ROUND_ENDED: 'round-ended',
  ERROR: 'error',
  PLAYER_ANSWERED: 'player-answered',
};

export class GameService {
  constructor(gameState, db) {
    this.gameState = gameState;
    this.db = db;
    this.roundTimers = new Map(); // roomId → timer handle
    this.isRoundActive = new Map(); // roomId → boolean
  }

  async startRound(roomId, roundIndex, io) {
    // Validate parameters
    if (!io) {
      console.error(`[GameService] ❌ Missing io parameter for room ${roomId}`);
      return;
    }

    try {
      const room = this.gameState.getRoom(roomId);
      
      // Check if room exists
      if (!room) {
        console.warn(`[GameService] ❌ Room ${roomId} not found`);
        io.to(roomId).emit(EVENTS.ERROR, { message: 'Room not found' });
        return;
      }

      // Validate round index
      const totalRounds = room.questions.getTotalRounds() || 0;
      if (roundIndex < 0 || roundIndex >= totalRounds) {
        console.warn(`[GameService] ❌ Invalid roundIndex ${roundIndex} for room ${roomId} (total: ${totalRounds})`);
        io.to(roomId).emit(EVENTS.ERROR, { message: 'Invalid round index' });
        return;
      }

      // Prevent multiple simultaneous rounds
      if (this.isRoundActive.get(roomId)) {
        console.warn(`[GameService] ⚠️ Round already active in room ${roomId}`);
        io.to(roomId).emit(EVENTS.ERROR, { message: 'Round already in progress' });
        return;
      }

      // Set the round index and get the current question
      room.questions.setRoundIndex(roundIndex);
      const question = room.questions.getCurrentQuestion();
      if (!question) {
        console.error(`[GameService] 🔥 Unexpected: no question at roundIndex ${roundIndex}`);
        io.to(roomId).emit(EVENTS.ERROR, { message: 'No question found' });
        return;
      }

      // Update room status
      room.status = 'playing';
      room.currentRoundIndex = roundIndex;
      this.isRoundActive.set(roomId, true);

      // Round started
      io.to(roomId).emit(EVENTS.ROUND_STARTED, {
        roundIndex,
        question,
        timeLeft: room.timeToAnswer,
        totalRounds,
      });

      // Start timer
      const timerDuration = room.timeToAnswer * 1000;
      const handlerTimer = setTimeout(async () => {
        console.log(`[GameService] 🕒 Timer fired → ending round ${roundIndex} in ${roomId}`);
        try {
          await this.endRound(roomId, io);
        } catch (error) {
          console.error(`[GameService] ❌ Error in endRound: ${error.message}`);
        }
      }, timerDuration);
      
      this.roundTimers.set(roomId, handlerTimer);
      console.log(`[GameService] ✅ Round ${roundIndex} started in room ${roomId}`);
    } catch (error) {
      console.error(`[GameService] ❌ Error starting round: ${error.message}`);
      io.to(roomId).emit(EVENTS.ERROR, { message: 'Internal server error' });
    }
  }

  async endRound(roomId, io) {
    try {
      const room = this.gameState.getRoom(roomId);
      if (!room) {
        console.warn(`[GameService] ❌ Room ${roomId} not found in endRound`);
        return;
      }

      // Clear timer
      this.cancelRound(roomId);
      this.isRoundActive.delete(roomId);

      // Update room status
      room.status = 'waiting';
      
      // TODO: Calculate and save scores
      // TODO: Emit round ended event with results
      io.to(roomId).emit(EVENTS.ROUND_ENDED, {
        roundIndex: room.currentRoundIndex,
        answers: room.players.map(player => ({
          playerId: player.id,
          answer: player.currentAnswer,
          timeTaken: player.timeTaken,
        })),
      });

      console.log(`[GameService] ✅ Round ended in room ${roomId}`);
    } catch (error) {
      console.error(`[GameService] ❌ Error ending round: ${error.message}`);
    }
  }
  
  cancelRound(roomId) {
    const timerId = this.roundTimers.get(roomId);
    if (timerId) {
      clearTimeout(timerId);
      this.roundTimers.delete(roomId);
      console.log(`[GameService] ⏹️ Timer cancelled for room ${roomId}`);
    } else {
      console.log(`[GameService] 🟡 No timer to cancel in room ${roomId}`);
    }
  }

  // Utility methods
  isRoundActive(roomId) {
    return this.isRoundActive.get(roomId) || false;
  }

  cleanupRoom(roomId) {
    this.cancelRound(roomId);
    this.isRoundActive.delete(roomId);
    console.log(`[GameService] 🧹 Cleaned up room ${roomId}`);
  }
}
