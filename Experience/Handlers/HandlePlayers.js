export default class HandlePlayers {
  constructor(experience) {
    this.experience = experience;
  }

  async playerConnect(socket, { roomId, playerToken }) {
    const experience = this.experience;
    const { notifier, repositories } = experience;

    const game = experience.games.get(roomId);
    if (!game) {
      notifier.error(socket, 'Game not found');
      return;
    }

    socket.join(roomId);
    socket.isHost = false;
    socket.roomId = roomId;
    socket.playerToken = playerToken;

    // Game manages its own players.
    const playerService = game.players;
    const isGameStarted = game.status === 'playing';
    
    try {
      const playerData = await repositories.player.getByToken( playerToken );
      if (!playerData) {
        return notifier.error(socket, 'Player not found');
      }

      const playerUpdateData = {
        ...playerData,
        isConnected: 1,
        lastSeenAt: new Date(),
      };

      await repositories.player.update( playerToken, playerUpdateData );
      playerService.upsert(playerToken, playerUpdateData);

      // Success path continues
      const players = game.players.getAll();
      notifier.playerUpdate( roomId, players, isGameStarted );
    } catch (error) {
      console.error('Player connection failed:', error);
      notifier.error(socket, 'Connection failed, please retry');
      socket.disconnect();
    }

    if (isGameStarted) {
      const currentRound = game.getCurrentRound();
      socket.emit('round-started', currentRound);
    }
  }
}
