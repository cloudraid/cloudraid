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
StorageManagerRaid1.prototype.createFile = function(filename, path, fn) {
    //TODO: Upload file to tmp folder
    path = "tmp/test.txt";

    this.getStorageProviders(function(err, providers) {
        providers.forEach(function(provider) {
            provider.createFile(filename, path);
        });
    });
    this.calculateHashOfFile(path, function(err, hash) {
        database.collection('files', function(err, collection) {
            collection.insert({
                filename: filename,
                hash: hash
            }, fn);
        });
    });
};

module.exports = StorageManagerRaid1;
