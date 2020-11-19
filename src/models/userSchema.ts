import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifyHash: String,
  password: String,
  admin: Boolean,
  debug: Boolean,
});

UserSchema.statics.findByName = function (name) {
  const userRegEx = new RegExp(`^${name}$`, 'i');
  return this.findOne({ username: userRegEx });
};

export default UserSchema;
