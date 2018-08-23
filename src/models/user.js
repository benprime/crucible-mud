import mongoose from 'mongoose';
import UserSchema from './userSchema';

const User = mongoose.model('User', UserSchema);

export default User;
