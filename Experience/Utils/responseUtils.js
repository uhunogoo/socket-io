// Standard envelope for all client responses
export function createResponse(eventType, data) {
  return {
    type: eventType,
    timestamp: new Date(),
    data
  };
}

// Public player data (minimal, safe to broadcast)
export function sanitizePlayer( player ) {
  if ( !player ) return null;

  return {
    id: player.id,
    name: player.name,
    avatar: player.avatar ?? null,
    isOnline: player.isOnline === true || player.isOnline === 'true',
    score: Number( player.score ?? 0 ),
    streak: Number( player.streak ?? 0 ),
  }
}

// Question without answer (for clients)
export function sanitizeQuestion(question) {
  const { _key, questionText, options, questionType, media, timeLimit } = question;
  
  return { 
    id: _key,
    text: questionText,
    options: options,
    type: questionType,
    media,
    timeLimit
  };
}