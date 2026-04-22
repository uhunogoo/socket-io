export default class HandleDisconnect {
  constructor( experience ) {
    this.experience = experience;
  }

  disconnect( socket ) {
    const { playerToken, roomId } = socket;
    
    if (playerToken && roomId) {
      const game = this.experience.games.get( roomId );
      
      if (game) {
        const playerService = game.players;
        
        if (playerService) {
          const newPlayerData = {
            isConnected: 0,
            lastSeenAt: new Date()
          };
          // Update player
          playerService.update( playerToken, newPlayerData );
          this.experience.db.updatePlayer( playerToken, newPlayerData );
        }
      }

      // Broadcast updated player list
      const players = game.players.getAll();
      
      this.experience.notifier.playerUpdate( roomId, players );
    }
  }
}