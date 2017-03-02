const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
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

const User = mongoose.model('User', UserSchema);

module.exports = User;
