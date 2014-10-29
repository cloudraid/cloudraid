var StorageManager = require('./StorageManager');
var util = require('util');
var database = require('./database');

function StorageManagerRaid1() {
    StorageManager.prototype.initialize();
}

util.inherits(StorageManagerRaid1, StorageManager);

StorageManager.prototype.type = 'raid1';
StorageManager.prototype.getFileList = function(fn) {
    database.collection('files', function(err, collection) {
                collection.find({}).toArray(fn);
    });
};
StorageManager.prototype.createFile = function(filename, path) {
    StorageManager.prototype.getStorageProviders(function(providers) {
        providers.forEach(function(provider) {
            console.log("StorageProvider:" + provider);
            provider.createFile(filename, path);
        });
    });
};

module.exports = StorageManagerRaid1;
