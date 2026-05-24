import crypto from 'crypto';

export default class HandlePlayers {
  constructor(experience) {
    this.experience = experience;
  }

  async playerConnect(socket, { roomPin, playerToken, ...playerData }) {
    const experience = this.experience;
    const { notifier, repositories } = experience;
    const game = experience.games.get( roomPin );

    if (!game) {
      notifier.error(socket, 'Game not found');
      return;
    }

    // Game manages its own players
    const room = game.room;
    const playerService = game.players;
    const playerRepository = repositories.player;
    const isGameStarted = game.status === 'playing';
    
    try {
      const playerUpdateData = {
        id: crypto.randomUUID(),
        playerToken: playerToken,
        roomId: room.id,
        isHost: false,
        joinedAt: new Date(),
        ...playerData,
      };

      // Update player in repository and service
      const updatedPlayer = await playerRepository.upsert( playerUpdateData );
      playerService.upsert( playerToken, updatedPlayer );

      // Add to socket
      await socket.join( roomPin );
      socket.isHost = false;
      socket.roomPin = roomPin;
      socket.playerToken = playerToken;


      // Success path continues
      const players = game.players.getAll();
      notifier.playerUpdate( roomPin, {
        room: game.room,
        players,
        quiz: game.quiz,
        isGameStarted: isGameStarted
      } );
    
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
