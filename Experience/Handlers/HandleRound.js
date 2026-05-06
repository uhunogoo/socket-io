import { EventEmitter } from 'events';

export default class HandleRound extends EventEmitter {
  constructor( experience ) {
    super();
    this.experience = experience;
  }

  startRound( io, { roomId } ) {
    const game = this.experience.games.get( roomId );
    if ( !game ) {
      this.experience.notifier.error( io, 'Room not found' );
      return;
    }
    
    // Start round
    const roundData = game.startRound();
    
    // Round timer
    const existingTimer = game.timers.get( 'roundTimer' );
    if ( existingTimer ) {
      clearTimeout( existingTimer );
    }
    
    game.timers.set( 'roundTimer', setTimeout(() => {
      this.endRound( io, { roomId } );
    }, game.timeToAnswer ) );
  
    // Notify players
    this.experience.notifier.roundStarted( roomId, roundData );
  }

  endRound( io, { roomId } ) {
    const experience = this.experience;
    const game = experience.games.get( roomId );

    if ( !game ) {
      experience.notifier.error( io, 'Room not found' );
      return;
    }

    // Prepare game for next round
    game.status = 'between_rounds';
    
    // Clear round timer
    const existingTimer = game.timers.get( 'roundTimer' );
    if ( existingTimer ) {
      clearTimeout( existingTimer );
    }

    // Add missing answers
    game.answers.addMissingAnswers();

    // Flush answers and update player scores
    const batch = game.answers.flushRound();
    for ( const answer of batch ) {
      const player = game.players.get( answer.playerToken );
      game.players.upsert( answer.playerToken, {
        totalScore: ( player.totalScore || 0 ) + ( answer.scoreEarned || 0 ),
        streak: answer.answerStreak || 0
      } );
    }
    const allPlayers = game.players.getAll();

    // Save round data to database
    experience.repositories.round.saveRound( batch, allPlayers );
    
    // End current round
    this.experience.notifier.roundEnded( roomId, {
      answers: batch,
      players: allPlayers
    } );

    // Check if game is over
    this.isGameOver( game );
    
    // If game is not over, switch to next round
    if ( game.status !== 'finished' ) {
      game.switchToNextRound();
  
      // console.log( 'All answers: ', game.answers.answersHistory );  
    }
  }

  isGameOver( game ) {
    // Get current round data
    const gameData = game.getGameData();

    // Game is over
    if ( ( gameData.currentRound + 1 ) >= gameData.questionsCount ) {
      game.status = 'finished';
      this.emit( 'game-over' );
    }
  }
}

