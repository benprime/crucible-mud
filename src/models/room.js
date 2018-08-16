import mongoose from 'mongoose';
import RoomSchema from './roomSchema';

const Room = mongoose.model('Room', RoomSchema);

Room.populateRoomCache();

export default Room;
