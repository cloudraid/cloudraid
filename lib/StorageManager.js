var StorageProviderFactory = require('./StorageProviderFactory');
var storageProviders = new Array;

function StorageManager() {
}

StorageManager.prototype.type = 'unknown';
StorageManager.prototype.initialize = function() {
    StorageProviderFactory.create('amazon', function(err, amazonProvider) {
        storageProviders.push(amazonProvider);
    });
    StorageProviderFactory.create('box', function(err, boxProvider) {
        storageProviders.push(boxProvider);
    });
    StorageProviderFactory.create('dropbox', function(err, dropboxProvider) {
        storageProviders.push(dropboxProvider);
    });
}
StorageManager.prototype.getStorageProviders = function(providers) {
    providers(storageProviders);
};

module.exports = StorageManager;
