var StorageProviderAmazon = require('./StorageProviderAmazon');
var StorageProviderBox = require('./StorageProviderBox');
var StorageProviderDropbox = require('./StorageProviderDropbox');

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
