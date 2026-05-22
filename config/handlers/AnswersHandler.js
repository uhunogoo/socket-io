import { eq, and } from "drizzle-orm";
import { SCHEMA } from '../database.js';

export default class AnswersHandler {
  constructor( db ) {
    this.db = db;
  }

  async add( answersBatch = []) {
    const answerSchema = SCHEMA.roomAnswers;
    if (!answersBatch.length) return null;
    
    const timeNow = new Date();
    const batch = answersBatch.map( (answer) => ({
      ...answer,
      createdAt: timeNow,
    }) );

    // Batch insert
    await this.db.insert( answerSchema ).values( batch );

    return true;
  }

  async get( roomToken, roundId ) {
    const answerSchema = SCHEMA.roomAnswers;
    const answers = this.db
      .select()
      .from( answerSchema )
      .where( and(
        eq( answerSchema.roomID, roomToken ),
        eq( answerSchema.roundId, roundId ),
      ) )
      .returning();

  }
}