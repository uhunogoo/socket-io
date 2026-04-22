// Standard envelope for all client responses
export function createResponse(eventType, data) {
  return {
    type: eventType,
    timestamp: Date.now(),
    data
  };
}

// Public player data (minimal, safe to broadcast)
export function sanitizePlayer( player ) {
  const { playerToken, nickname, avatar, isConnected, score = 0, streak } = player;

  return {
    token: playerToken,
    name: nickname,
    avatar,
    isConnected: isConnected === 1,
    score: score,
    streak: streak
  };
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