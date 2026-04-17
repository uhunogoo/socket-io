import EventEmitter from '../Utils/EventEmitter.js';

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
    game.setRoundData();

    // Get round data
    const roundData = game.getRoundData();
    
    // Round timer
    const existingTimer = game.timers.get( 'roundTimer' );
    if ( existingTimer ) {
      clearTimeout( existingTimer );
    }
    
    game.timers.set( 'roundTimer', setTimeout(() => {
      this.endRound( io, { roomId } );
    }, game.room.timeToAnswer * 1000) );
    
    // Notify players
    io.to( roomId ).emit( 'round-started', roundData );
  }

  endRound( io, { roomId } ) {
    const game = this.experience.games.get( roomId );
    if ( !game ) {
      return io.to( roomId ).emit('error', { message: 'Room not found' });
    }
    
    game.status = 'between_rounds';
    game.currentRound++;
    // const roundData = game.getRoundData();
    
    const existingTimer = game.timers.get( 'roundTimer' );
    if ( existingTimer ) {
      clearTimeout( existingTimer );
    }

    io.to( roomId ).emit( 'round-ended' );
  }
}
