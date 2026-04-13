export default class HandleHost {
  constructor( experience ) {
    this.experience = experience;
  }

  async hostConnect( socket, { roomId, playerToken, questions } ) {
    // console.log({ roomId, playerToken, questions });

    // Game managment
    let game = this.experience.games.get( roomId );
    if ( !game ) {
      // Game not found, create a new one
      const room = await this.experience.db.getRoomById( roomId );
      const { players, answers } = await this.experience.db.getAllRoomData( roomId );
      
      game = this.experience.buildGame( room, players, answers );
      this.experience.games.set( roomId, game );
    }

    // Add questions to game
    for ( const question of questions ) {
      game.questions.add( question );
    }
    
    // Socket management
    socket.join( roomId );
    socket.isHost = true;
    socket.roomId = roomId;

    const players = game.players.getAll();
    socket.emit('players-update', { players });
  }
}