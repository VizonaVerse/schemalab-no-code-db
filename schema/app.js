var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

require('dotenv').config();

// example route (index.js file in routes)
var indexRouter = require('./routes/index');
// add new routes here

var app = express();

const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONT_END_URL, // Allow only specific origin
  methods: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Setup express-session (currently redacted)
// app.use(session({
//   name: 'sessionId', // Change this to a secure name
//   secret: 'secret', // Change this to a secure key
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: false, // Set to true in production with HTTPS
//     maxAge: 1000 * 60 * 60 * 24, // 1 day
//     sameSite: 'Lax', // Use 'None' if you want to allow cross-origin cookies
//   }
// }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// example route
app.use('/', indexRouter);
// add new routes here


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
