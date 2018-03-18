const config = require('./config');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const prettyError = require('pretty-error');
const session = require('./middleware/session');
// const cookieParser = require('cookie-parser');

const jobsRouter = require('./routers/jobs');
const authRouter = require('./routers/auth');
const serverSideRendering = require('./routers/ssr');

// better error messages & console.log
prettyError.start();
// require('./lib/log');

const app = express();

app.set('port', config.port);

app.use(logger('dev'));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(session());
// app.use(cookieParser(config.cookieSecret));
app.use(
  '/assets',
  express.static(path.resolve(__dirname, 'dist/assets'))
);

app.use('/api/jobs', jobsRouter);
app.use('/auth', authRouter);

app.use(serverSideRendering(app));

app.listen(app.get('port'), () => {
  const port = app.get('port');
  console.log(`http://localhost:${port} server's running`);
});
