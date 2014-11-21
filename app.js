var crypto = require('crypto');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var checkCredentials = require('./lib/users').checkCredentials;

var routes = require('./routes/index');
var files = require('./routes/files');
var settings = require('./routes/settings');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.raw({ limit: '16mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: crypto.randomBytes(64).toString()
}));
app.use(express.static(path.join(__dirname, 'public')));

function restrict(requireadmin) {
  return function(req, res, next) {
    if (!req.session.data || !req.session.data.isadmin && requireadmin) {
      res.redirect('/login');
    } else {
      next();
    }
  }
}

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.render('logout');
  });
});

app.use(function(req, res, next) {
  var data = req.session.data;
  if (data) {
    res.locals.userdata = data;
  }
  next();
});

app.use('/', routes);
app.use('/files', restrict(), files);
app.use('/settings', restrict(), settings);
app.use('/users', restrict(true), users);

app.get('/login', function(req, res) {
  var failed = req.session.loginFailed;
  delete req.session.loginFailed;
  res.render('login', {
    failed: failed
  });
});

app.post('/login', function(req, res) {
  checkCredentials(req.body.username, req.body.password, function(data) {
    if (data) {
      req.session.regenerate(function() {
        req.session.data = data;
        res.redirect('/files');
      });
    } else {
      req.session.loginFailed = true;
      res.redirect('/login');
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
