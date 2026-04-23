export default class HandleDisconnect {
  constructor( experience ) {
    this.experience = experience;
  }

  disconnect( socket ) {
    const { playerToken, roomId } = socket;
    const experience = this.experience;
    const { notifier, repositories } = experience;
    
    if (playerToken && roomId) {
      const game = experience.games.get( roomId );
      
      if (game) {
        const playerService = game.players;
        
        if (playerService) {
          const newPlayerData = {
            isConnected: 0,
            lastSeenAt: new Date()
          };
          // Update player
          playerService.update( playerToken, newPlayerData );
          repositories.player.update( 
            playerToken, 
            playerService.get( playerToken ) 
          );
        }
      }

      // Broadcast updated player list
      const players = game.players.getAll();
      
      notifier.playerUpdate( roomId, players );
    }
  }
}