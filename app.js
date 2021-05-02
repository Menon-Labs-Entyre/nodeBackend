const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const searchRouter = require('./routes/search');

const app = express();
const BASE_API_URL = 'https://entyre-frontend.herokuapp.com';
app.use(cors({credentials: true, origin: BASE_API_URL}));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard warrior',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, 
    httpOnly: false,
    maxAge: null
  }
}))


// view engine setup
const buildPath = path.join(__dirname, '..', 'entyre-frontend', 'build');
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(buildPath));

app.use('/', indexRouter);
app.use('/search',searchRouter)
app.use('/users', usersRouter);

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  //res.header('Access-Control-Allow-Origin', req.headers.origin);
  //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  //res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

