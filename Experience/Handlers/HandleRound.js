import EventEmitter from '../Utils/EventEmitter.js';
import { copyObject } from '../../lib/helpers.js';

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
    
    game.status = 'playing';
    
    // Game data
    const gameData = game.getGameData();
    const roundStartedAt = Date.now();
    
    // Round timer
    const existingTimer = game.timers.get( 'roundTimer' );
    if ( existingTimer ) {
      clearTimeout( existingTimer );
    }
    
    game.timers.set( 'roundTimer', setTimeout(() => {
      this.endRound( io, { roomId } );
    }, game.timeToAnswer ) );

    // Add round data
    const roundData = copyObject({ ...gameData, roundStartedAt });
    game.rounds.add( gameData.currentRound, roundData );
    
    // Notify players
    this.experience.notifier.roundStarted( roomId, roundData );
  }

  endRound( io, { roomId } ) {
    const game = this.experience.games.get( roomId );
    if ( !game ) {
      this.experience.notifier.error( io, 'Room not found' );
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

    // Flush answers
    const batch = game.answers.flushRound();
    
    // End current round
    // this.experience.notifier.roundEnded( roomId, batch );

    // Check if game is over
    this.isGameOver( game );
    
    // If game is not over, switch to next round
    if ( game.status !== 'finished' ) {
      game.rounds.switchToNextRound();
  
      // console.log( 'All answers: ', game.answers.answersHistory );  
    }
  }

  isGameOver( game ) {
    // Get current round data
    const gameData = game.getGameData();

    // Game is over
    if ( ( gameData.currentRound + 1 ) >= gameData.questionsCount ) {
      game.status = 'finished';
      this.trigger( 'game-over' );
    }
  }
}

