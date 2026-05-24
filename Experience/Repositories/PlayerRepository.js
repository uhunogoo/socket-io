export default class PlayerRepository {
  constructor( db ) {
    this.db = db;
  }

  async upsert( playerData ) {
    return await this.db.players.upsert( playerData );
  }

  async getByToken( playerToken ) {
    return await this.db.players.get( playerToken );
  }

  async getAllByRoomID( roomId ) {
    return await this.db.players.getAll( roomId );
  }
}
