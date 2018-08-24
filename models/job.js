const {mongoose} = require('../lib/db');
const {platforms, jobsTypes} = require('../config/static');
require('./job-details');

const {Schema} = mongoose;

let schema = new Schema({
  jobId: {
    type: String,
    unique: true
  },

  jobCurrId: {
    type: String,
    required: true
  },

  rockstar: {
    type: Boolean
  },

  star: {
    type: Boolean
  },

  author: {
    type: String,
    required: notRockstar
  },

  name: {
    type: String,
    trim: true,
    required: true
  },

  slug: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  players: {
    type: [{
      type: Number,
      min: 1,
      max: 30
    }],
    validate: pl => {
      return (pl.length === 1)
        || (pl.length === 2 && pl[0] <= pl[1]);
    }
  },

  platform: {
    type: Number,
    required: notRockstar,
    validate: plat => {
      return Object.keys(platforms).some(platName => platName === plat);
    }
  },

  scType: {
    type: Number,
    required: true,
    validate: type => {
      return Object.keys(jobsTypes).some(typeName => typeName === type);
    }
  },

  scMode: {
    type: Number
  },

  tags: {
    type: [String]
  },

  details: {
    type: Schema.Types.Mixed,
    ref: 'JobDetails',
    required: true
  },

  stats: {
    trend: {
      type: Number,
      default: 1
    },

    growth: {
      type: Number,
      default: 1
    },

    playTot: {
      type: Number,
      required: true
    },

    playUnq: {
      type: Number,
      required: true
    },

    likes: {
      type: Number,
      required: true
    },

    dislikes: {
      type: Number,
      required: true
    },

    dislikesQuit: {
      type: Number,
      required: true
    },

    rating: {
      type: Number,
      required: true
    },

    ratingQuit: {
      type: Number,
      required: true
    }
  },

  ver: {
    type: Number,
    required: true
  },

  scAdded: {
    type: Date
  },

  scUpdated: {
    type: Date,
    required: true
  },

  fetchDate: {
    type: Date,
    required: true
  }
}, {
  id: false,
  toObject: {
    virtuals: true,
    versionKey: false
  }
});

schema.virtual('imageUrl')
  .set(function(url) {
    const str = url.split('/');
    this.image = `${str[5]}.${str[7]}`;
  })
  // .get(function() {
  //   const img = this.image.split('.');
  //   const { jobCurrId } = this;
  //   return `https://prod.cloud.rockstargames.com/ugc/gta5mission/${img[0]}/${jobCurrId}/${img[1]}.jpg`;
  // });

schema.pre('save', function(next) {
  const {scType, scMode} = this;

  // Type validation
  const typeInfo = jobsTypes[scType];

  if (!!this.rockstar !== !!typeInfo.rockstar) {
    throw new Error('Non-rockstar jobs cannot be added with a type that only appers for rockstar jobs or vice versa');
  }

  // Mode validation
  const possibleModes = typeInfo.modes;

  if (!!this.scMode !== !!possibleModes) {
    throw new Error('This job type does not have any modes or vice versa');
  }

  if (!Object.keys(possibleModes).some(modeName => modeName === scMode)) {
    throw new Error('Mode does not exist');
  }

  // Tags validation

  next();
});


function notRockstar() {
  return !this.rockstar;
}

module.exports = mongoose.model('Job', schema);
