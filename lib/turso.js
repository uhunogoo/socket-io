import 'dotenv/config';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const TABLES = {
  ROOMS: 'room',
  ROOM_PLAYERS: 'room_player',
};

export async function getRoom( roomId, playerToken ) {
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

export async function updateRoomStatus( roomId, status ) {
  await db.execute({
    sql: `
      UPDATE ${ TABLES.ROOMS }
      SET status = ?
      WHERE id = ?
    `,
    args: [ status, roomId ],
  });
}

export async function updateRoomCurrentRound( id, currentRound, roundLength ) {
  await db.execute({
    sql: `
      UPDATE ${ TABLES.ROOMS } 
      SET currentRound = ?, roundStartedAt = ?, roundEndsAt = ?, updatedAt = ?
      WHERE id = ?
    `,
    args: [ currentRound, Date.now(), Date.now() + roundLength, Date.now(), id ],
  });
}

export async function updatePlayerOnline( playerToken, isConnected = 1 ) {
  await db.execute({
    sql: `
      UPDATE ${ TABLES.ROOM_PLAYERS } 
      SET isConnected = ?, lastSeenAt = ?
      WHERE playerToken = ?
    `,
    args: [ isConnected, Date.now(), playerToken ],
  });
}

export async function getPlayerOnline( roomId ) {
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

