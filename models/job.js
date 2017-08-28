const config = require('../config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let jobSchema = new Schema({
  jobId: { type: String, required: true, unique: true },

  name: { type: String, required: true, trim: true },
  desc: { type: String, required: true, trim: true },
  platId: { type: Number, required: true },
  author: { type: String },
  img: { type: String, required: true },
  modeId: { type: Number, required: true },
  flags: { type: [String] },

  verif: {
    rstarJob: { type: Boolean },
    rstarVerif: { type: Boolean },
    ourVerif: { type: Boolean, required: true, default: false }
  },

  stats: {
    playTot: { type: Number, required: true },
    playUnq: { type: Number, required: true },
    quitTot: { type: Number, required: true },
    quitUnq: { type: Number, required: true },
    likes: { type: Number, required: true },
    dlikes: { type: Number, required: true },
    bkmk: { type: Number, required: true },
    rating: { type: Number, required: true },
    ratingReal: { type: Number, required: true }
  },

  updated: {
    ver: { type: Number, required: true },
    job: { type: Date, required: true },
    info: { type: Date, required: true }
  }
});

jobSchema.virtual('mode')
  .set(function(mode) {
    this.modeId = config.modesId[mode];
  })
  .get(function() {
    return {
      name: config.modes[this.modeId].name,
      icon: config.modes[this.modeId].icon
    };
  });

jobSchema.virtual

jobSchema.virtual('platform')
  .set(function(platform) {
    this.platId = {
      'PC': 1,
      'Ps4': 2,
      'XBoxOne': 3,
      'Ps3': 4,
      'XBox': 5
    }[platform];
  })
  .get(function() {
    return config.platforms[this.platId];
  });

jobSchema.virtual('imageUrl')
  .set(function(url) {
    let str = url.split('/');
    this.img = `${str[5]}.${str[7].split('_')[0]}`;
  })
  .get(function() {
    let info = this.img.split('.');
    return `https://prod.cloud.rockstargames.com/ugc/gta5mission/${info[0]}/${this.jobId}/${info[1]}_0.jpg`;
  });

module.exports = mongoose.model('Job', jobSchema, 'jobs');
