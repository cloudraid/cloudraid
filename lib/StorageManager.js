var StorageProviderFactory = require('./StorageProviderFactory');
var storageProviders = new Array;

function StorageManager() {
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

StorageManager.prototype.type = 'unknown';
StorageManager.prototype.getStorageProviders = function(fn) {
    fn(null, storageProviders);
};

module.exports = StorageManager;
