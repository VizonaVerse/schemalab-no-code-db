//var session = require('express-session');
require('dotenv').config({ path: '.env' });

const express = require('express')
const app = express()
app.use(express.json());
const port = process.env.PORT

// example route (index.js file in routes)
var indexRouter = require('./routes/index');
// add new routes here
var buildRouter = require('./routes/build');

// example route
app.use('/', indexRouter);
// add new routes here
app.use('/build', buildRouter)

const cors = require('cors');
const cookieParser = require('cookie-parser');

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

var server = app.listen(port, () => {
  console.log(`Schema-Build listening on port ${port}`)
})

module.exports = {app, server};