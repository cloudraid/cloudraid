var StorageManagerFactory = require('../lib/StorageManagerFactory');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  StorageManagerFactory.create(req.session.data.settings, function(err, storageManager) {
    res.render('files', {
      storageManager: storageManager
    });
  });
});

module.exports = router;
