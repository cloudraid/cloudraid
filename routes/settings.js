var express = require('express');
var router = express.Router();
var users = require('../lib/users');
var settings = require('../lib/settings');

router.get('/', function(req, res) {
  settings.read(function(settings) {
    req.session.settings = settings;
    res.locals.settings = settings;
    res.render('settings');
  })
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

    users.update(req.session.userdata.username, oldPassword, newPassword, req.body.name, req.body.raidmode, function(err) {
      if (err) {
        res.render('error', {
          message: err,
          error: {}
        });
      } else {
        users.checkCredentials(req.session.userdata.username, newPassword, function(data) {
          if(data) {
            req.session.userdata = data;

            if(req.session.userdata.isadmin) {
              settings.update(req.body.settings, function(err) {
                if (err) {
                  res.render('error', {
                    message: err,
                    error: {}
                  });
                } else {
                  req.session.settings = req.body.settings;
                  res.redirect('/settings');
                }
              });
            } else {
              req.session.settings = req.body.settings;
              res.redirect('/settings');
            }
          } else {
            res.redirect('/settings');
          }
        });
      }
    });
  }
});

module.exports = router;
