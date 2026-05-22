export default class HandlePlayers {
  constructor(experience) {
    this.experience = experience;
  }

  async playerConnect(socket, { roomId, playerToken, ...playerData }) {
    const experience = this.experience;
    const { notifier, repositories } = experience;
    const game = experience.games.get( roomId );
    console.log( game );
    if (!game) {
      notifier.error(socket, 'Game not found');
      return;
    }

    // Game manages its own players
    const playerService = game.players;
    const playerRepository = repositories.player;
    const isGameStarted = game.status === 'playing';
    
    try {
      const playerUpdateData = {
        id: crypto.randomUUID(),
        roomId: roomId,
        isHost: false,
        joinedAt: new Date(),
        ...playerData,
      };

      // Update player in repository and service
      const updatedPlayer = await playerRepository.upsert( playerUpdateData );
      playerService.upsert( playerToken, updatedPlayer );

      // Add to socket
      await socket.join( roomId );
      socket.isHost = false;
      socket.roomId = roomId;
      socket.playerToken = playerToken;


      // Success path continues
      const players = game.players.getAll();
      notifier.playerUpdate( roomId, {
        room: game.room,
        players: players ?? [],
        questions: game.questions ?? [],
        isGameStarted
      } )
    
      if ( isGameStarted ) {
        const currentRound = game.getCurrentRound();
        socket.emit( 'round-started', currentRound );
      }
    } catch ( error ) {
      console.error( 'Player connection failed:', error );
      notifier.error( socket, 'Connection failed, please retry' );
      socket.disconnect();
    }
  }
}
