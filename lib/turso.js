import 'dotenv/config';

export const TABLES = {
  ROOMS: 'room',
  ROOM_PLAYERS: 'room_player',
  ANSWERS: 'room_answer',
};

export async function getRoomFromDB(db, roomId, playerToken ) {
  const roomData = await db.execute({
    sql: `
      SELECT *
      FROM ${ TABLES.ROOMS }
      WHERE id = ? AND hostId = ?
    `,
    args: [ roomId, playerToken ],
  });

  return roomData;
}
export async function getAllActiveRooms( db ) {
  const result = await db.execute({
    sql: `
      SELECT * 
      FROM ${ TABLES.ROOMS }
    `,
    args: []
  });

  return result.rows;
}

export async function updateRoomStatus( db, roomId, status ) {
  await db.execute({
    sql: `
      UPDATE ${ TABLES.ROOMS }
      SET status = ?
      WHERE id = ?
    `,
    args: [ status, roomId ],
  });
}

export async function getPlayerByToken( db, playerToken ) {
  const result = await db.execute({
    sql: `
      SELECT *
      FROM ${ TABLES.ROOM_PLAYERS }
      WHERE playerToken = ?
    `,
    args: [ playerToken ]
  });

  return result.rows[0] || null;
}

export async function updatePlayerOnline( db, playerToken, isConnected = 1 ) {
  await db.execute({
    sql: `
      UPDATE ${ TABLES.ROOM_PLAYERS } 
      SET isConnected = ?, lastSeenAt = ?
      WHERE playerToken = ?
    `,
    args: [ isConnected, Date.now(), playerToken ],
  });
}

export async function getPlayerOnline( db, roomId ) {
  const result = await db.execute({
    sql: `
      SELECT id, nickname, score, streak, isConnected
      FROM ${ TABLES.ROOM_PLAYERS }
      WHERE roomId = ?
    `,
    args: [ roomId ],
  });

  return (result?.rows || []).map( row => ({
    id: row[0],
    nickname: row[1],
    score: row[2],
    streak: row[3],
    isConnected: row[4],
  }))
}

export async function getDbPlayersByRoom(db, roomId) {
  const result = await db.execute({
    sql: `
      SELECT id, playerToken, nickname, score, streak, isConnected, lastSeenAt
      FROM ${TABLES.ROOM_PLAYERS}
      WHERE roomId = ?
    `,
    args: [roomId],
  });

  return (result?.rows || []).map(row => ({
    id: row[0],
    playerToken: row[1],
    nickname: row[2],
    score: row[3],
    streak: row[4],
    isConnected: row[5],
    lastSeenAt: row[6],
  }));
}

export async function syncAndGetPlayers( db, roomId, activeTokens = [] ) {
  if (activeTokens.length === 0) {
    // All offline if no one is active
    await db.execute({
      sql: `
        UPDATE ${TABLES.ROOM_PLAYERS}
        SET isConnected = 0
        WHERE roomId = ?
      `,
      args: [roomId],
    });
    return [];
  }

  // Placeholders: ?, ?, ? for each token
  const placeholders = activeTokens.map(() => '?').join(', ');

  const results = await db.batch([
    // All offline
    {
      sql: `
        UPDATE ${TABLES.ROOM_PLAYERS}
        SET isConnected = 0
        WHERE roomId = ?
      `,
      args: [roomId],
    },
    // Only active players online
    {
      sql: `
        UPDATE ${TABLES.ROOM_PLAYERS}
        SET isConnected = 1
        WHERE roomId = ? AND playerToken IN (${placeholders})
      `,
      args: [ roomId, ...activeTokens ],
    },
    {
      sql: `
        SELECT id, nickname, score, streak, isConnected
        FROM ${TABLES.ROOM_PLAYERS}
        WHERE roomId = ?
      `,
      args: [roomId],
    },
  ]);

  return (results[2]?.rows || []).map(row => ({
    id: row[0],
    nickname: row[1],
    score: row[2],
    streak: row[3],
    isConnected: row[4],
  }));
}

export async function batchInsertAnswers( db, answers) {

  // Use batch transaction for speed
  return await db.batch(
    answers.map(ans => ({
      sql: `
        INSERT INTO ${ TABLES.ANSWERS } (
          room_id, player_id, question_id, answer_index, is_correct, points, answered_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        ans.roomId,
        ans.playerId,
        ans.questionId,
        ans.answerIndex,
        ans.isCorrect,
        ans.points,
        ans.answeredAt.toISOString()
      ]
    }))
  );
}

