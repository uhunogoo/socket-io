class HandleHost {
  constructor(experience) {
    this.experience = experience;
  }

  async hostConnect( socket, data ) {
    const { roomPin, playerToken } = data;
    const experience = this.experience;
    const {notifier, repositories} = experience;

    // Game managment
    let game = experience.games.get( roomPin );
    if (!game) return;

    // Socket management
    await socket.join( roomPin );
    socket.isHost = true;
    socket.roomPin = roomPin;

    const players = game.players.getAll();
    const isGameStarted = game.status === 'playing';

    notifier.playerUpdate( roomPin, {
      room: game.room,
      players,
      quiz: game.quiz,
      isGameStarted: isGameStarted
    } );

    if ( isGameStarted ) {
      const currentRound = game.getCurrentRound();
      socket.emit('round-started', currentRound);
    }
  }

  async createRoom( socket, data ) {
    const { roomData, playerData, quiz } = data;
    if ( !roomData || !playerData || !quiz ) return;

    // Params
    const experience = this.experience;
    const { notifier, repositories } = experience;

    // Game managment
    let game = experience.games.get( roomData.pin );
    if ( !game ) {
      const roomToInsert = {
        ...roomData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdRoom = await repositories.room.add( roomToInsert );
      game = experience.buildGame({
        room: createdRoom,
        quiz: quiz,
        roomPlayers: [],
      });

      // Add game to experience
      experience.games.set( createdRoom.pin, game );
    }

    // Add questions to game
    game.quiz = quiz;

    // Socket management
    socket.roomPin = roomData.pin;
  }
}

export default HandleHost