export default class RoomRepository {
  constructor( db ) {
    this.db = db;
  }

  async getOrCreate( roomId ) {
    try {
      let room = await this.db.getRoomById( roomId );
      if ( !room ) throw new Error( 'Room not found' );
      return room;
    } catch ( error ) {
      console.error( 'Error getting room:', error );
      throw error;
    }
  }
  
  async getFullRoomData( roomId ) {
    try {
      const { players, answers } = await this.db.getAllRoomData( roomId );
      return { players, answers };
    } catch ( error ) {
      console.error( 'Error getting full room data:', error );
      throw error;
    }
  }
  
  async getAllInitialData() {
    try {
      const { rooms, players, answers } = await this.db.getAllInitialData();
      return { rooms, players, answers };
    } catch ( error ) {
      console.error( 'Error getting all initial data:', error );
      throw error;
    }
  }
}