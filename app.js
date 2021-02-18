const config = require('./utils/config');
const LOG = require('./utils/logger');

const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const uuid = require('node-uuid');
const mongoose = require('mongoose');
const HttpError = require('./utils/HttpError');

// routers
const userRoutes = require('./routes/userRoutes');

// connect to db
LOG.info('⌛connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => LOG.info('✅connected to MongoDB'))
  .catch(error => LOG.error('❌error connecting to MongoDB:', error.message));
mongoose.set('useCreateIndex', true);

// app setting
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/static'));

// morgan logging
morgan.token('id', function getId(req) {
  return req._id;
});
morgan.token('body', function getBody(req) {
  return JSON.stringify(req.body);
});
morgan.token('date', function () {
  return new Date().toLocaleString('en-CA', { timeZone: 'America/Vancouver' });
});
app.use((req, res, next) => {
  req._id = uuid.v4();
  next();
});

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(
      '--> [:date[web]] :id :remote-addr :remote-user :method :url :body content-length::req[content-length]',
      { immediate: true }
    )
  );
  app.use(
    morgan(
      '<-- [:date[web]] :id status::status response-time::response-time[digits]ms content-length::res[content-length]',
      { immediate: false }
    )
  );
}

// api
app.get('/version', (req, res) => {
  res.status(200).json({ message: config.VERSION });
});

// routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH'
  );

  next();
});

app.use('/api/user', userRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Route not found', 404);
  return next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);

  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

module.exports = app;
