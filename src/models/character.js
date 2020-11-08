/** @module models/Character */
import mongoose from 'mongoose';
import CharacterSchema from './characterSchema';

/**
 * @constructor
 */
const Character = mongoose.model('Character', CharacterSchema);


export default Character;
