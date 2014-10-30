var StorageManagerFactory = require('../lib/StorageManagerFactory');
var express = require('express');
var router = express.Router();
var storManager = null;

router.get('/', function(req, res) {
  StorageManagerFactory.create(req.session.data.settings, function(err, storageManager) {
    storManager = storageManager;
    storageManager.getFileList(function(err, filelist) {
      res.render('files', {
        storageManager: storageManager,
        files: filelist
      });
    });

  });
});

router.post('/create', function(req, res) {
  console.log(req.body);
  storManager.createFile(req.body.filename, req.body.data, function(err) {
    if (err) {
      res.render('error', {
        message: err,
        error: {}
      });
    } else {
      res.redirect('/files');
    }
  });
});

module.exports = router;
