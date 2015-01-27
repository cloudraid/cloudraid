var express = require('express');
var router = express.Router();
var users = require('../lib/users');

router.get('/', function(req, res) {
  users.list(function(err, users) {
    res.render('users', {
      users: users
    });
  });
});

router.post('/add', function(req, res) {
  if (req.body.username === '') {
    res.render('error', {
      message: 'Empty username',
      error: {}
    });
  } else if (req.body.password1 !== req.body.password2) {
    res.render('error', {
      message: 'Password missmatch',
      error: {}
    });
  } else {
    users.add(req.body.username, req.body.password1, req.body.name, req.body.raidmode, req.body.isadmin, function(err) {
      if (err) {
        res.render('error', {
          message: err,
          error: {}
        });
      } else {
        res.redirect('/users');
      }
    });
  }
});

router.get('/delete/:username', function(req, res) {
  users.remove(req.params.username, function(err) {
    if (err) {
      res.render('error', {
        message: err,
        error: {}
      });
    } else {
      res.redirect('/users');
    }
  });
});

module.exports = router;
