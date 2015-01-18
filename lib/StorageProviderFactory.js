var StorageProviderAmazon = require('./StorageProviderAmazon');
var StorageProviderBox = require('./StorageProviderBox');
var StorageProviderDropbox = require('./StorageProviderDropbox');

var availableStorageProviders = null;

module.exports.create = function(credentials, fn) {
    try {

        if (credentials.type === 'amazon')
            return fn(null, new StorageProviderAmazon(credentials));
        if (credentials.type === 'box')
            return fn(null, new StorageProviderBox(credentials));
        if (credentials.type === 'dropbox')
            return fn(null, new StorageProviderDropbox(credentials));

        fn(null, null);
    } catch (ex) {
        fn(ex, null);
    }
};

module.exports.getAvailableStorageProviders = function(fn) {
    if(!availableStorageProviders) {
        availableStorageProviders = [];

        availableStorageProviders.push(StorageProviderAmazon);
        availableStorageProviders.push(StorageProviderBox);
        availableStorageProviders.push(StorageProviderDropbox);
    }

    fn(availableStorageProviders);
};

module.exports.getStorageProviderByType = function(type, fn) {
    this.getAvailableStorageProviders(function(providers) {
        var foundProviders = providers.filter(function(storageProvider) {
            return (storageProvider.prototype.type === type);
        });

        if(foundProviders.length === 0)
            fn(null);
        else
            fn(foundProviders[0]);
    });
};
