const config = require('./config');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const chalk = require('chalk');

const jobsRouter = require('./routers/jobs');
const errorHandler = require('./routers/error');

const app = express();

app.disable('x-powered-by');
app.set('port', config.port);

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, config.distDir)));

app.use('/api/jobs', jobsRouter);

app.use(history());

errorHandler(app);

// Run server
app.listen(app.get('port'), () => {
  console.log(
    chalk.bgBlue(' INFO '),
    chalk.blue(`Server is running at http://localhost:${app.get('port')}`)
  );
});
