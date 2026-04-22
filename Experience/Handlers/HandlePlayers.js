export default class HandlePlayers {
  constructor( experience ) {
    this.experience = experience;
  }

  async playerConnect( socket, { roomId, playerToken } )  {
    const game = this.experience.games.get( roomId );
    if (!game) {
      this.experience.notifier.error( socket, 'Game not found' );
      return;
    }

    socket.join( roomId );
    socket.isHost = false;
    socket.roomId = roomId;
    socket.playerToken = playerToken;

    // Clean! The game manages its own players.
    const playerService = game.players;
    const player = playerService.get( playerToken );
    const playerUpdateData = {
      isConnected: 1,
      lastSeenAt: new Date()
    };

    if (!player) {
      const playerData = await this.experience.db.getPlayerByToken( playerToken );
      if (!playerData) {
        return socket.emit('error', { message: 'Player not found' });
      }
      
      // Add player to game
      playerService.add( {
        ...playerData,
        ...playerUpdateData
      } );
    } else {
      // Player already exists, update their data
      playerService.update( playerToken, playerUpdateData );
    }

    await this.experience.db.updatePlayer( playerToken, playerUpdateData );

    const players = game.players.getAll();
    const isGameStarted = game.status === 'playing';
    
    this.experience.notifier.playerUpdate( roomId, players, isGameStarted );
    if ( isGameStarted ) {
      const currentRound = game.rounds.getCurrentRound();
      socket.emit( 'round-started', currentRound );
    }
  }
}