export function createPlayerRecord( playerId, playerData = {} ) {
  return {
    id: playerId,
    name: playerData.name ?? 'Player',
    avatar: playerData.avatar ?? '',
    score: String(playerData.score ?? 0),
    streak: String(playerData.streak ?? 0),
    isOnline: String(playerData.isOnline ?? true),
    joinedAt: String(new Date()),
  };
}