export default class PlayerRepository {
  constructor( db ) {
    this.db = db;
  }

  async getByToken( token ) {
    return await this.db.getPlayerByToken( token );
  }
  
  async update( token, data ) {
    return await this.db.updatePlayer( token, data );
  }
}