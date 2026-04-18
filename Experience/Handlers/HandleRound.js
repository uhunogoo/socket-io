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
      return io.to( roomId ).emit('error', { message: 'Room not found' });
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
    io.to( roomId ).emit( 'round-started', roundData );
  }

  endRound( io, { roomId } ) {
    const game = this.experience.games.get( roomId );
    if ( !game ) {
      return io.to( roomId ).emit('error', { message: 'Room not found' });
    }

    // Prepare game for next round
    game.status = 'between_rounds';
    game.rounds.switchToNextRound();
    
    // Clear round timer
    const existingTimer = game.timers.get( 'roundTimer' );
    if ( existingTimer ) {
      clearTimeout( existingTimer );
    }

    // Flush answers
    const batch = game.answers.flushRound();
    console.log('Batch data:', batch);

    // End current round
    io.to( roomId ).emit( 'round-ended', { batch } );
  }
}

