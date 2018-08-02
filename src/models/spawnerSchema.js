import mongoose from 'mongoose';

export default new mongoose.Schema({
  mobTypes: [String],
  timeout: {
    type: Number,
  },
  max: {
    type: Number,
  },
});