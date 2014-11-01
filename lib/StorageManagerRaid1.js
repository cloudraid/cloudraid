var StorageManager = require('./StorageManager');
var util = require('util');
var database = require('./database');
var storageManager;

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
    var count = 0;
    this.getStorageProviders(function(err, providers, storageManager) {
        providers.forEach(function(provider) {
            provider.createFile(filename, path, function() {
                count++;
                if(count === providers.length) {
                    storageManager.calculateHashOfFile(path, function(err, hash) {
                        database.collection('files', function(err, collection) {
                            collection.insert({
                                filename: filename,
                                hash: hash
                            }, fn);
                        });
                    });
                }
            });
        });
    });
};
StorageManagerRaid1.prototype.readFile = function(filename, fn) {
    var correctHash;
    var correctProviders = new Array();
    var incorrectProviders = new Array();
    var storageManager = this;

    database.collection('files', function(err, collection) {
        collection.findOne({filename: filename}, function(err, file) {
            if (!file)
                return fn('File does not exist');

            correctHash = file.hash;
            storageManager.getStorageProviders(function(err, providers, storageManager) {
                var count = 0;
                providers.forEach(function(provider) {
                    provider.readFile(filename, function(path) {
                        storageManager.calculateHashOfFile(path, function(err, hash) {
                            if(hash === correctHash) {
                                correctProviders.push(provider);
                            }else{
                                incorrectProviders.push(provider);
                            }
                            count++;
                            if(count === providers.length) {
                                if(correctProviders.length > 0) {
                                    incorrectProviders.forEach(function(incorrectProvider) {
                                        console.log('Incorrect file at Provider ' + incorrectProvider.type);
                                       incorrectProvider.deleteFile(filename, function() {
                                           incorrectProvider.createFile(filename, 'tmp/tmp_read_' + correctProviders[0].type, function() {});
                                       });
                                    });
                                    return fn(null, 'tmp/tmp_read_' + correctProviders[0].type);
                                }else{
                                    console.log('All files corrupted');
                                    return fn('All files corrupted');
                                }
                            }
                        });
                    });
                });
            });
        });
    });
};
StorageManagerRaid1.prototype.deleteFile = function(filename, fn) {
    var count = 0;
    this.getStorageProviders(function(err, providers, storageManager) {
        providers.forEach(function(provider) {
            provider.deleteFile(filename, function() {
                count++;
                if(count === providers.length) {
                    database.collection('files', function(err, collection) {
                        collection.remove({filename: filename}, fn);
                    });
                }
            });
        });
    });
};
module.exports = StorageManagerRaid1;
