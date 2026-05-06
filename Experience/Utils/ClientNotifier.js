import { createResponse, sanitizePlayer, sanitizeQuestion } from './responseUtils.js';

export default class ClientNotifier {
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
      status: roundData.status,
      question: sanitizeQuestion( roundData.questions ),
      duration: roundData.roundDuration,
      startsAt: Date.now(),
      playersCount: roundData.players?.length
    } );
    
    this.io.to( roomId ).emit( 'round-started', payload );
  }

  roundEnded( roomId, roundData ) {
    if ( !roundData ) return;
    const { answers, players } = roundData;

    const payload = createResponse( 'round-ended', {
      results: answers.map( answer => ( {
        playerToken: answer.playerToken,
        isCorrect: answer.isCorrect,
        scoreEarned: answer.scoreEarned,
        responseTime: answer.responseTime,
        answerStreak: answer.answerStreak
      } )),
      leaderboard: players.map( player => ( {
        playerToken: player.playerToken,
        score: player.score,
        streak: player.streak
      } ))
    } );

    this.io.to( roomId ).emit( 'round-ended', payload );
  }

  // Personal events
  answerAccepted( socket, playerAnswer, answer ) {
    // TODO: Implement answer accepted notification
  }

  // Error
  error( socket, message ) {
    socket.emit( 'error', createResponse( 'error', { message } ) );
  }
}