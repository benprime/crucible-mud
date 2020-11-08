import mongoose from 'mongoose';
import UserSchema from './userSchema';

const User = mongoose.model('User', UserSchema);

// Working around a mongoose issue where the indexes aren't getting created.
User.createIndexes();

export default User;
