import { createResponse, sanitizePlayer, sanitizeQuestion } from './responseUtils.js';

export default class ClientNotifire {
  constructor( io ) {
    this.io = io;
  }

  // Player update notification
  playerUpdate( roomId, players, isGameStarted = false ) {
    const payload = createResponse( 'players-update', {
      players: players.map( sanitizePlayer ),
      totalPlayers: players.length,
      connectedCount: players.filter(p => p.isConnected).length,
      isGameStarted
    } );

    this.io.to( roomId ).emit( 'players-update', payload );
  }

  // Round notifications
  roundStarted( roomId, roundData ) {
    const payload = createResponse( 'round-started', {
      roundIndex: roundData.currentRound,
      question: sanitizeQuestion( roundData.questions ),
      duration: roundData.roundDuration,
      startsAt: Date.now(),
      playersCount: roundData.players?.length
    } );

    console.log(payload);
    
    this.io.to( roomId ).emit( 'round-started', payload );
  }

  roundEnded( roomId, results, leaderboard ) {
    const payload = createResponse( 'round-ended', {
      results: results.map( r => ({
        playerToken: r.playerId,
        isCorrect: r.isCorrect,
        scoreEarned: r.scoreEarned,
        responseTime: r.responseTime
      }) ),
      leaderboard: leaderboard.map( p => ({
        token: p.playerToken,
        name: p.name,
        totalScore: p.totalScore
      }) )
    } );

    this.io.to( roomId ).emit( 'round-ended', payload );
  }

  // Personal events
  answerAccepted( socket, playerAnswer, answer ) {}

  // Error
  error( socket, message ) {
    socket.emit( 'error', createResponse( 'error', { message } ) );
  }
}