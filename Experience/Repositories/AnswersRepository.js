export default class AnswersRepository {
  constructor( db ) {
    this.db = db;
  }

  async saveBatch( batchAnswers ) {
    return await this.db.saveBatchAnswers( batchAnswers );
  }
}