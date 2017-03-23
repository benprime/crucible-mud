const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },

  username: {
    type: String,
    unique: true
  },
  
  // todo: hash this
  password: {
    type: String,
  },

  admin: {
    type: Boolean,
  },

  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room'
  }

});

UserSchema.statics.findByName = function(name, cb) {
  const userRegEx = new RegExp(`^${name}$`, 'i');
  return this.findOne({ username: userRegEx }, cb);
}

const User = mongoose.model('User', UserSchema);

module.exports = User;
