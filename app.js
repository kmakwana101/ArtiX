var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let session = require("express-session")
let passport = require("passport")
let mongoose =  require("mongoose")
let cors = require("cors")


var indexRouter = require('./routes/index');
var usersRouter = require('./models/users_models');
// let adminRouter = require("./routes/admin")

// my requires
// const connectMongo = require('connect-mongo');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const methodOverride = require('method-override');
// let session = require("express-session")

var app = express();
require('dotenv').config();
app.use(cors())

const uri = process.env.MONGODB_CONNECT_URI;
// mongodb+srv://kmakwana1255:<password>@cluster1.hfoy8xo.mongodb.net/?retryWrites=true&w=majority
mongoose.connect(uri || "mongodb+srv://kmakwana1255:kmakwana@cluster1.hfoy8xo.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(error => console.error('Error connecting to MongoDB:', error.message));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(session({
  resave:false,
  saveUninitialized:false,
  secret:"hello"
}))

app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(usersRouter.serializeUser())
passport.deserializeUser(usersRouter.deserializeUser())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/admin', adminRouter);

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
