import mongoose from 'mongoose';
const dirEnum = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd'];

const ExitSchema = new mongoose.Schema({
  dir: {
    type: String,
    enum: dirEnum,
  },
  roomId: {
    type: String,
  },
  closed: {
    type: Boolean,
  },
  keyName: {
    type: String,
  },
  locked: {
    type: Boolean,
  },
  hidden: {
    type: Boolean,
  },
});

export default ExitSchema;
