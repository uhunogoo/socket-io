import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

// Database schema
import * as schema from './db/schema.js';

// Handlers
import RoomHandler from './handlers/RoomHandler.js';
import RoundHandler from './handlers/RoundHandler.js';
import PlayerHandler from './handlers/PlayerHandler.js';
import AnswersHandler from './handlers/AnswersHandler.js';

// Parameters
export const DEFAULT_TTL = 60 * 60 * 3;
export const SCHEMA = {
  room: schema.rooms,
  roomPlayer: schema.roomPlayers,
  roomRound: schema.roomRounds,
  roomAnswers: schema.roomAnswers,
  roomResult: schema.roomResults,
};

export class Database {
  constructor() {
    this.db = drizzle({
      connection: {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
    });

    // Handlers
    this.room = new RoomHandler( this.db );
    this.rounds = new RoundHandler( this.db );
    this.players = new PlayerHandler( this.db );
    this.answers = new AnswersHandler( this.db );
  }

  async getSnapshot( roomCode ) {
    const roomSchema = SCHEMA.room;
    if ( !roomSchema ) return null;
    
    const [ room, players ] = await Promise.all( [
      this.room.get( roomCode ),
      this.players.getAll( roomCode ),
    ] );

    if ( !room ) return {};

    let round = [];
    let answers = [];

    if ( room.currentRound ) {
      round = await this.rounds.get( roomCode, room.currentRound );
      answers = await this.answers.get( roomCode, room.currentRound );
    }
    
    return {
      room,
      players,
      round,
      answers,
    };
  }
}
