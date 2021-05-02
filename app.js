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
app.use(cors({credentials: true, origin: 'http://localhost:8080'}));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard warrior',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
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

