import mongoose from 'mongoose';
import RoomSchema from './roomSchema';

const Room = mongoose.model('Room', RoomSchema);

export default Room;
