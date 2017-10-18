const config = require('../config');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongo.connectUri, config.mongo.options);

module.exports = mongoose;