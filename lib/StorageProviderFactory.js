var StorageProviderAmazon = require('./StorageProviderAmazon');
var StorageProviderBox = require('./StorageProviderBox');
var StorageProviderDropbox = require('./StorageProviderDropbox');

module.exports.create = function(type, fn) {
    try {

        if (type === 'amazon')
            return fn(null, new StorageProviderAmazon());
        if (type === 'box')
            return fn(null, new StorageProviderBox());
        if (type === 'dropbox')
            return fn(null, new StorageProviderDropbox());

        fn(null, null);
    } catch (ex) {
        fn(ex, null);
    }
};
