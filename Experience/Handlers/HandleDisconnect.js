export default class HandleDisconnect {
  constructor( experience ) {
    this.experience = experience;
  }

  async disconnect( socket ) {
    const experience = this.experience;
    const { notifier, repositories } = experience;

    const { playerToken, roomPin } = socket;
    if ( !playerToken || !roomPin ) {
      notifier.error( socket, 'Missing player token or room ID' );
      return;
    }
    
    const game = experience.games.get( roomPin );
    if ( !game ) {
      notifier.error( socket, 'Game not found' );
      return;
    }
    
    const playerService = game.players;
    const player = playerService.get( playerToken );
    if ( !player ) {
      notifier.error( socket, 'Player not found' );
      return;
    }
    
    try {
      const newPlayerData = {
        ...player,
        isConnected: 0,
        lastSeenAt: new Date()
      };

      // Update player
      await repositories.player.upsert( playerToken, newPlayerData );
      playerService.upsert( playerToken, newPlayerData );
  
      // Broadcast updated player list
      const players = game.players.getAll();
      notifier.playerUpdate( roomPin, {
        room: game.room,
        players,
        quiz: game.quiz,
        isGameStarted: game.status === 'playing'
      } );
    } catch ( error ) {
      console.error( 'Error updating player on disconnect:', error );
      notifier.error( socket, 'Failed to update player status' );
    }
  }
}