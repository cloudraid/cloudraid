var StorageProviderFactory = require('./StorageProviderFactory');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');
var storageProviders = new Array;

function StorageManager() {
    StorageProviderFactory.create({type:'amazon',username:'admin',password:'admin'}, function(err, amazonProvider) {
        storageProviders.push(amazonProvider);
    });
    StorageProviderFactory.create({type:'box',username:'admin',password:'admin'}, function(err, boxProvider) {
        storageProviders.push(boxProvider);
    });
    StorageProviderFactory.create({type:'dropbox',username:'admin',password:'admin'}, function(err, dropboxProvider) {
        storageProviders.push(dropboxProvider);
    });
}

StorageManager.prototype.type = 'unknown';
StorageManager.prototype.getStorageProviders = function(fn) {
    fn(null, storageProviders, this);
};
StorageManager.prototype.calculateHashOfFile = function(path, fn) {
    var hash = crypto.createHash('md5')
    var stream = fs.createReadStream(path);

    stream.on('data', function (data) {
        hash.update(data, 'utf8')
    })

    stream.on('end', function () {
        fn(null, hash.digest('hex'));
    })

};

StorageManager.prototype.createFile = function(file, data, fn) {
    async.each(storageProviders, function(provider, callback) {
        provider.createFile(file, data, callback);
    }, function(err) {
        if(!err) {
            console.log("Successfully created file: "+file)
        } else {
            console.log("Failed at creating file "+file+": "+err);
        }
        fn();
    });
};

StorageManager.prototype.readFile = function(file, fn) {
    // Read from providers one after the other until the hash matches
    // Alert the user if hashes don't match ("Mismatch! Do you want to recover?")
    fn();
};

StorageManager.prototype.deleteFile = function(file, fn) {
    async.each(storageProvider, function(provider, callback) {
        provider.deleteFile(file, callback);
    }, function(err) {
        if(!err) {
            console.log("Successfully deleted file: "+file)
        } else {
            console.log("Failed at deleting file "+file+": "+err);
        }
        fn();
    });
};

module.exports = StorageManager;
