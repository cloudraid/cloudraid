var StorageManagerFactory = require('../lib/StorageManagerFactory');
var StorageProviderFactory = require('../lib/StorageProviderFactory');
var express = require('express');
var router = express.Router();
var storManager = null;
var accounts = new Array();

router.get('/', function(req, res) {

	// Get Storage Manager
	StorageManagerFactory.getCachedStorageManager(req.session.data.settings, function(err, storageManager) {
		storManager = storageManager;

		// Get list of all Providers
		StorageProviderFactory.getAvailableStorageProviders(function(availableStorageProviders) {

			// Get list of all Providers that are currently used
			storageManager.getStorageProviders(function(err, usedStorageProviders) {
				res.render('accounts', {
					usedStorageProviders: usedStorageProviders,
					availableStorageProviders: availableStorageProviders
				});
			});
		});
	});
});

router.post('/add', function(req, res) {
  storManager.addStorageProvider(req.body.type, function(err) {
    if (err) {
      res.render('error', {
        message: err,
        error: {}
      });
    } else {
      res.redirect('/accounts');
    }
  });
});

module.exports = router;
