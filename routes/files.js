var StorageManagerFactory = require('../lib/StorageManagerFactory');
var express = require('express');
var router = express.Router();
var storManager = {};

function sm(req) {
  return storManager[req.session.data.username];
}

router.get('/', function(req, res) {
  StorageManagerFactory.create(req.session.data.username, req.session.data.settings, function(err, storageManager) {
    if (err) {
      res.render('error', {
        message: err,
        error: {}
      });
    } else {
      storageManager.setup(function(err) {
        req.session.storageManager = storageManager;
        storManager[req.session.data.username] = storageManager;

        if (err) {
          res.render('error', {
            message: err,
            error: {}
          });
        } else {
          res.render('files', {
            storageManager: storageManager
          });
        }
      });
    }
  });
});

router.get('/list', function(req, res) {
  sm(req).fileList(function(err, data) {
    res.json(data);
  });
});

router.post('/data/:filename', function(req, res) {
  sm(req).createFile(req.params.filename, req.body, function(err) {
    res.json({});
  });
});

router.get('/data/:filename/:version', function(req, res) {
  sm(req).readFile(req.params.filename, req.params.version, function(err, data) {
    res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.filename);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(data);
  });
});

router.delete('/data/:filename/:version', function(req, res) {
  sm(req).deleteFile(req.params.filename, req.params.version, function(err) {
    res.json({});
  });
});

module.exports = router;
