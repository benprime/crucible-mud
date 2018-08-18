import mongoose from 'mongoose';
import CharacterSchema from './characterSchema';

const Character = mongoose.model('Character', CharacterSchema);

export default Character;
