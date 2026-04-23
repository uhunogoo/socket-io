export default class HandleHost {
  constructor( experience ) {
    this.experience = experience;
  }

  async hostConnect( socket, { roomId, playerToken, questions } ) {
    const experience = this.experience;
    const { notifier, repositories } = experience;
    
    // Game managment
    let game = experience.games.get( roomId );
    if ( !game ) {
      // Game not found, create a new one
      const room = await repositories.room.getOrCreate( roomId );
      const { players, answers } = await repositories.room.getFullRoomData( roomId );
      
      game = experience.buildGame( room, players, answers );
      experience.games.set( roomId, game );
    }

    // Add questions to game
    game.questions = questions;
    
    // Socket management
    socket.join( roomId );
    socket.isHost = true;
    socket.roomId = roomId;

    const players = game.players.getAll();
    const isGameStarted = game.status === 'playing';
    
    notifier.playerUpdate( roomId, players, isGameStarted );

    if (isGameStarted) {
      const currentRound = game.getCurrentRound();
      socket.emit( 'round-started', currentRound );
    }
  }
}