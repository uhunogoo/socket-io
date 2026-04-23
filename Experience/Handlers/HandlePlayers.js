export default class HandlePlayers {
  constructor( experience ) {
    this.experience = experience;
  }

  async playerConnect( socket, { roomId, playerToken } )  {
    const experience = this.experience;
    const { notifier, repositories } = experience;

    const game = experience.games.get( roomId );
    if (!game) {
      notifier.error( socket, 'Game not found' );
      return;
    }

    socket.join( roomId );
    socket.isHost = false;
    socket.roomId = roomId;
    socket.playerToken = playerToken;

    // Game manages its own players.
    const playerService = game.players;
    const player = playerService.get( playerToken );
    const playerUpdateData = {
      isConnected: 1,
      lastSeenAt: new Date()
    };

    let updatedPlayer;
    if (!player) {
      const playerData = await repositories.player.getByToken( playerToken );
      if (!playerData) {
        return notifier.error( socket, 'Player not found' );
      }
      
      // Add player to game
      updatedPlayer = playerService.add( {
        ...playerData,
        ...playerUpdateData
      } );
    } else {
      // Player already exists, update their data
      updatedPlayer = playerService.update( playerToken, playerUpdateData );
    }

    await repositories.player.update( 
      playerToken,
      updatedPlayer
    );

    const players = game.players.getAll();
    const isGameStarted = game.status === 'playing';
    
    notifier.playerUpdate( roomId, players, isGameStarted );
    if ( isGameStarted ) {
      const currentRound = game.getCurrentRound();
      socket.emit( 'round-started', currentRound );
    }
  }
}