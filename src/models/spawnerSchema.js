const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  mobTypes: [String],
  timeout: {
    type: Number,
  },
  max: {
    type: Number,
  },
});