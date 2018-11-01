const random = require('lodash/random');

module.exports = {
  queueName: 'main-queue',

  queueOptions: {
    settings: {
      backoffStrategies: {
        // 20-40 mins
        jitter() {
          return 1000 * 60 * (20 + random(0, 20));
        },
      },
    },

    limiter: {
      max: 1,
      duration: 3000,
    },

    defaultJobOptions: {
      attempts: 100,
      backoff: {
        type: 'jitter',
      },
    },
  },
};
