export default class RoomRepository {
  constructor( db ) {
    this.db = db;
  }

  async add( roomData ) {
    try {
      const room = await this.db.room.add( roomData );
      return room;
    } catch ( error ) {
      console.error( 'Error getting room:', error );
      throw error;
    }
  }
  
  async getRoomSnapshot( roomPin ) {
    try {
      const { players, answers } = await this.db.getSnapshot( roomPin );
      return { players, answers };
    } catch ( error ) {
      console.error( 'Error getting room snapshot:', error );
      throw error;
    }
  }

  async getAll() {
    try {
      return await this.db.room.getAll();
    } catch ( error ) {
      console.error( 'Error getting all rooms:', error );
      throw error;
    }
  }
}