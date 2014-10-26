var express = require('express');
var router = express.Router();
var users = require('../lib/users');

router.get('/', function(req, res) {
  res.render('settings');
});

router.post('/', function(req, res) {
  if (req.body.password1 !== req.body.password2) {
    res.render('error', {
      message: 'Password missmatch',
      error: {}
    });
  } else {
    var oldPassword = req.body.password;
    var newPassword = req.body.password1;
    if (newPassword === '')
      newPassword = oldPassword;
    users.update(req.session.data.username, oldPassword, newPassword, req.body.name, req.body.settings, function(err) {
      if (err) {
        res.render('error', {
          message: err,
          error: {}
        });
      } else {
        users.checkCredentials(req.session.data.username, newPassword, function(data) {
          req.session.data = data;
          res.redirect('/settings');
        });
      }
    });
  }
});

module.exports = router;
