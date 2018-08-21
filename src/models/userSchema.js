import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  // todo: hash this
  password: {
    type: String,
  },
  admin: {
    type: Boolean,
  },
  debug: {
    type: Boolean,
  },
});

UserSchema.statics.findByName = function (name, cb) {
  const userRegEx = new RegExp(`^${name}$`, 'i');
  return this.findOne({ username: userRegEx }, cb);
};

export default UserSchema;
