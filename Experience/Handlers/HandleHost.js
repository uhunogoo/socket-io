class HandleHost {
  constructor(experience) {
    this.experience = experience;
  }

  async hostConnect( socket, data ) {
    const { roomId, playerToken } = data;
    const experience = this.experience;
    const {notifier, repositories} = experience;

    // Game managment
    let game = experience.games.get( roomId );
    console.log(roomId, playerToken);
    if (!game) return;

    // Socket management
    await socket.join( roomId );
    socket.isHost = true;
    socket.roomId = roomId;

    const players = game.players.getAll();
    const isGameStarted = game.status === 'playing';
    console.log('ok')
    notifier.playerUpdate( roomId, {
      room: game.room,
      players: players ?? [],
      questions: game.questions ?? [],
      isGameStarted
    } );

    if ( isGameStarted ) {
      const currentRound = game.getCurrentRound();
      socket.emit('round-started', currentRound);
    }
  }

  async createRoom( socket, data ) {
    const { roomData, playerData, quiz } = data;
    const experience = this.experience;
    const { notifier, repositories } = experience;

    // Game managment
    let game = experience.games.get( roomData.pin );
    if ( !game ) {
      // Game not found, create a new one
      const roomToInsert = {
        ...roomData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const playerToInsert = {
        ...playerData,
        joinedAt: new Date(),
      }

      const createdRoom = await repositories.room.add( roomToInsert );
      const players = await repositories.player.upsert( playerData );

      game = experience.buildGame( createdRoom, players, [] );
      experience.games.set( createdRoom.pin, game );
    }

    // Add questions to game
    game.quiz = quiz;
    game.questions = quiz.questions;

    // Socket management
    socket.roomId = roomData.pin;
  }
}

export default HandleHost