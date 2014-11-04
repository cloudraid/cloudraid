var StorageProviderFactory = require('./StorageProviderFactory');
var crypto = require('crypto');
var fs = require('fs');
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

StorageManager.prototype.addStorageProvider = function(newProviderType, fn) {
    StorageProviderFactory.getStorageProviderByType(newProviderType, function(newProviderConstructor) {
        storageProviders.push(new newProviderConstructor());
        fn(null);
    });
}

// Important: For RAID 5, at least three providers have to exist
StorageManager.prototype.deleteStorageProvider = function(newProviderType, fn) {
    //TODO
    fn(null);
}

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

module.exports = StorageManager;
