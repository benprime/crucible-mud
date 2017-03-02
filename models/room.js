const mongoose = require('mongoose');

const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd'];

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  desc: {
    type: String,
  },

  // should this be in a sub-object called "position" or "coords"?
  x: {
    type: Number,
  },
  y: {
    type: Number,
  },
  z: {
    type: Number,
  },

  exits: [{
    dir: {
      type: String,
      enum: directions,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
    }
  }]

});

RoomSchema.statics.byCoords = function(x,y,z,cb) {
  return this.findOne({ x: x, y: y, z: z }, cb);
};

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
