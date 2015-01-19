var express = require('express');
var router = express.Router();
var users = require('../lib/users');
var settings = require('../lib/settings');

router.get('/', function(req, res) {
  res.render('settings');
});

router.post('/', function(req, res) {
  if (req.body.password1 !== req.body.password2) {
    res.render('error', {
      message: 'Password missmatch',
      error: {}
    });
  } else {
    var oldPassword = req.body.password;
    var newPassword = req.body.password1;
    if (newPassword === '') {
      newPassword = oldPassword;
    }

      users.checkAdminCredentials(req.session.data.username, newPassword, function(err, data) {
      if (err) {
        res.render('error', {
          message: err,
          error: {}
        });
      } else {
        settings.update(req.body.settings, function(err) {
          if (err) {
            res.render('error', {
              message: err,
              error: {}
            });
          } else {
            data.settings = req.body.settings;
            req.session.data = data;
            res.redirect('/settings');
          }
        });
      }
    });
  }
});

module.exports = router;
