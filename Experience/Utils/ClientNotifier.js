import { createResponse, sanitizePlayer, sanitizeQuestion } from './responseUtils.js';

export default class ClientNotifier {
  constructor( io ) {
    this.io = io;
  }

  // Player update notification
  playerUpdate( roomPin, data ={} ) {
    if ( !data || !roomPin ) return false;

    const payload = createResponse( 'players-update', {
      room: data.room,
      quiz: data.quiz,
      players: data.players.map( sanitizePlayer ),
      totalPlayers: data.players.length,
      connectedCount: data.players.filter(p => p.isConnected).length,
      isGameStarted: data.isGameStarted,
    } );

    this.io.to( roomPin ).emit( 'players-update', payload );
  }

  // Round notifications
  roundStarted( roomPin, roundData ) {
    const payload = createResponse( 'round-started', {
      roundIndex: roundData.currentRound,
      status: roundData.status,
      question: sanitizeQuestion( roundData.questions ),
      duration: roundData.roundDuration,
      startsAt: new Date(),
      playersCount: roundData.players?.length
    } );
    
    this.io.to( roomPin ).emit( 'round-started', payload );
  }

  roundEnded( roomPin, roundData ) {
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

    this.io.to( roomPin ).emit( 'round-ended', payload );
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