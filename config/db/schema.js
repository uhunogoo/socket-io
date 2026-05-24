import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const rooms = sqliteTable( 'room', {
  id: text( 'id' ).primaryKey(),
  pin: text( 'pin', { length: 6 } ).notNull().unique(),
  hostId: text( 'hostId' ).notNull(),
  gameMode: text( 'gameMode', { enum: ['guess_the_majority', 'chat_judges', 'best_chat_answer_wins', 'bot_or_not'] } ).notNull(),
  maxPlayers: integer( 'maxPlayers' ).default( 50 ).notNull(),
  status: text( 'status', { enum: ['lobby', 'playing', 'between_rounds', 'finished'] } ).default( 'lobby' ).notNull(),
  timeToAnswer: integer( 'timeToAnswer' ).default( 30 ).notNull(),
  currentRound: integer( 'currentRound' ).default( 0 ).notNull(),
  createdAt: integer( 'createdAt', { mode: 'timestamp' } ).notNull(),
  updatedAt: integer( 'updatedAt', { mode: 'timestamp' } ).notNull(),
},
(table) => [
  index( 'room_host_idx' ).on( table.hostId ),
  index( 'room_status_idx' ).on( table.status ),
  index( 'room_game_mode_idx' ).on( table.gameMode ),
] );

export const roomPlayers = sqliteTable( 'room_player', {
  id: text( 'id' ).primaryKey(),
  roomId: text( 'roomId' ).notNull().references( () => rooms.id, { onDelete: 'cascade' } ),
  playerToken: text( 'playerToken' ).notNull(),
  name: text( 'name', { length: 100 } ).notNull(),
  isHost: integer( 'isHost', { mode: 'boolean' } ).default( false ).notNull(),
  score: integer('score').default(0).notNull(),
  streak: integer('streak').default(0).notNull(),
  correctAnswers: integer('correctAnswers').default(0).notNull(),
  isOnline: integer( 'isOnline', { mode: 'boolean' } ).default( true ).notNull(),
  joinedAt: integer( 'joinedAt', { mode: 'timestamp' } ).notNull(),
  lastSeenAt: integer( 'lastSeenAt', { mode: 'timestamp' } ),
},
(table) => [
  uniqueIndex( 'room_player_token_unique' ).on( table.roomId, table.playerToken ),
  uniqueIndex( 'room_player_name_unique' ).on( table.roomId, table.name ),
  index( 'room_player_room_idx' ).on( table.roomId ),
] );

export const roomRounds = sqliteTable( 'room_round', {
  id: text( 'id' ).primaryKey(),
  roomId: text( 'roomId' ).notNull().references( () => rooms.id, { onDelete: 'cascade' } ),
  roundNumber: integer( 'roundNumber' ).notNull(),
  question: text( 'question' ).notNull(),
  correctAnswer: text( 'correctAnswer' ),
  startedAt: integer( 'startedAt', { mode: 'timestamp' } ),
  endedAt: integer( 'endedAt', { mode: 'timestamp' } ),
  createdAt: integer( 'createdAt', { mode: 'timestamp' } ).notNull(),
},
(table) => [
  uniqueIndex( 'room_round_unique' ).on( table.roomId, table.roundNumber ),
  index( 'room_round_room_idx' ).on( table.roomId ),
] );

export const roomAnswers = sqliteTable( 'room_answer', {
  id: text( 'id' ).primaryKey(),
  roomId: text( 'roomId' ).notNull().references( () => rooms.id, { onDelete: 'cascade' } ),
  roundId: text( 'roundId' ).notNull().references( () => roomRounds.id, { onDelete: 'cascade' } ),
  playerId: text( 'playerId' ).notNull().references( () => roomPlayers.id, { onDelete: 'cascade' } ),
  answer: text( 'answer' ).notNull(),
  isAi: integer( 'isAi', { mode: 'boolean' } ).default( false ).notNull(),
  isCorrect: integer( 'isCorrect', { mode: 'boolean' } ),
  responseTime: integer( 'responseTime' ),
  scoreEarned: integer( 'scoreEarned' ).default( 0 ).notNull(),
  createdAt: integer( 'createdAt', { mode: 'timestamp' } ).notNull(),
},
(table) => [
  uniqueIndex( 'room_answer_unique' ).on( table.roundId, table.playerId ),
  index( 'room_answer_room_idx' ).on( table.roomId ),
  index( 'room_answer_round_idx' ).on( table.roundId ),
  index( 'room_answer_player_idx' ).on( table.playerId ),
] );

export const roomResults = sqliteTable( 'room_result', {
  id: text( 'id' ).primaryKey(),
  roomId: text( 'roomId' ).notNull().references( () => rooms.id, { onDelete: 'cascade' } ),
  playerId: text( 'playerId' ).notNull().references( () => roomPlayers.id, { onDelete: 'cascade' } ),
  finalScore: integer( 'finalScore' ).default( 0 ).notNull(),
  correctAnswers: integer( 'correctAnswers' ).default( 0 ).notNull(),
  createdAt: integer( 'createdAt', { mode: 'timestamp' } ).notNull(),
},
(table) => [
  uniqueIndex( 'room_result_unique' ).on( table.roomId, table.playerId ),
  index( 'room_result_room_idx' ).on( table.roomId ),
  index( 'room_result_player_idx' ).on( table.playerId ),
] );