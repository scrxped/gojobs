const mongoose = require('../lib/db');
const Schema = mongoose.Schema;

let schema = new Schema({
  category: {
    type: String,
    enum: ['rockstar', 'rockstarverified']
  },

  username: {
    type: String
  },
  
  crewId: {
    type: String
  },

  platform: {
    type: String,
    enum: ['pc', 'ps4', 'xb1'],
    required: isPlatformRequired
  },

  period: {
    type: String,
    enum: ['today', 'last7', 'last30']
  },

  lastFetch: {
    type: Date
  },

  total: {
    type: Number,
    default: 0
  },

  skip: {
    type: Number,
    default: 0
  }
});

function isPlatformRequired() {
  const { by } = this;
  return by !== 'rockstar' && by !== 'rstarverified';
}

module.exports = mongoose.model('FetchStats', schema);