var StorageManager = require('./StorageManager');
var util = require('util');
var database = require('./database');

function StorageManagerRaid1() {
    StorageManager.call(this);
}

util.inherits(StorageManagerRaid1, StorageManager);

StorageManagerRaid1.prototype.type = 'raid1';
StorageManagerRaid1.prototype.getFileList = function(fn) {
    database.collection('files', function(err, collection) {
                collection.find({}).toArray(fn);
    });
};
StorageManagerRaid1.prototype.createFile = function(filename, path) {
    StorageManager.prototype.getStorageProviders(function(err, providers) {
        providers.forEach(function(provider) {
            console.log("StorageProvider:" + provider);
            provider.createFile(filename, path);
        });
    });
};

module.exports = StorageManagerRaid1;
