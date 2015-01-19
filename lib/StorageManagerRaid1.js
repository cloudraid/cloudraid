var StorageManager = require('./StorageManager');
var async = require('async');
var util = require('util');

function StorageManagerRaid1(username, settings) {
    StorageManager.call(this, username, settings);
}

util.inherits(StorageManagerRaid1, StorageManager);

//info returns a more verbose items array
StorageManagerRaid1.prototype.info = function (fn) {
    var self = this;

    self.collection(function (err, collection) {
        if (err)
            return fn(err);

        collection.find({
            username: self.username
        }).toArray(function (err, items) {
            if (err)
                return fn(err);
            if (!items)
                return fn('File does not exist');

            // items contains all filename versions
            async.forEach(items, function (item, callbackEachItems) {
                // item is one file version - so one file

                // read this file from each provider
                self.forEachProvider(function (provider, callbackEachProvider) {

                    // read file from this provider
                    self.createFilenameWithVersion(item.filename, item.version, function (filenameWithVersion) {
                        provider.readFile(self.username, filenameWithVersion, function (err, data) {
                            if (err) return callbackEachProvider(err);

                            // file not found or empty
                            if (!data) {
                                item['exists' + provider.type] = false;
                                item['hashRead' + provider.type] = "";
                                item['hashMatch' + provider.type] = false;
                            }

                            // have data of this provider - calculate hash
                            else self.calculateHash(data, function (err, hash) {
                                if (err) return callbackEachProvider(err);

                                item['exists' + provider.type] = true;
                                item['hashRead' + provider.type] = hash;
                                item['hashMatch' + provider.type] = (hash === item.hash);
                            });

                            // TODO debuging output
                            console.log("item: " + item.filename + "_" + item.version + "_" +
                            " - exists: " + item['exists' + provider.type] +
                            " - match: " + item['hashMatch' + provider.type]);

                            callbackEachProvider(null);
                        });
                    });

                // callback after eachProvider read file
                }, function (err) {
                    callbackEachItems(err);
                });

            // callback for StorageManagerRaid5.prototype.info - returns items array
            }, function (err) {
                fn(err, items);
            });
        });
    });
};

StorageManagerRaid1.prototype.createFile = function (filename, data, fn) {
    var self = this;

    self.collection(function (err, collection) {
        if (err)
            return fn(err);

        collection.find({
            username: self.username,
            filename: filename
        }).toArray(function (err, items) {
            var version;
            if (items === undefined) {
                version = (1).toString();
            } else {
                version = (items.length + 1).toString();
            }

            self.calculateHash(data, function (err, hash) {
                if (err)
                    return fn(err);

                self.createFilenameWithVersion(filename, version, function (filenameWithVersion) {
                    self.forEachProvider(function (provider, callback) {
                        provider.createFile(self.username, filenameWithVersion, data, callback);
                    }, function (err) {
                        if (err)
                            return fn(err);

                        collection.insert([
                            {
                                username: self.username,
                                filename: filename,
                                version: version,
                                size: data.length,
                                insertDate: new Date(),
                                hash: hash
                            }], fn);
                    });
                });
            });
        });
    });
};

StorageManagerRaid1.prototype.readFile = function (filename, version, fn) {
    var self = this;

    self.collection(function (err, collection) {
        if (err)
            return fn(err);

        collection.findOne({
            username: self.username,
            filename: filename,
            version: version
        }, function (err, file) {
            if (err)
                return fn(err);
            if (!file)
                return fn('File does not exist');

            var correctData = null;
            var correctHash = file.hash;
            var incorrectProviders = [];
            self.forEachProvider(function (provider, callback) {
                self.createFilenameWithVersion(filename, version, function (filenameWithVersion) {
                    provider.readFile(self.username, filenameWithVersion, function (err, data) {
                        if (err)
                            return callback(err);

                        self.calculateHash(data, function (err, hash) {
                            if (err)
                                return callback(err);

                            if (hash === correctHash) {
                                correctData = data;
                            } else {
                                incorrectProviders.push(provider);
                            }

                            callback(null);
                        });
                    });
                });
            }, function (err) {
                if (err)
                    return fn(err);

                if (correctData) {
                    async.forEach(incorrectProviders, function (incorrectProvider, callback) {
                        console.log('Incorrect file at Provider ' + incorrectProvider.type);
                        self.createFilenameWithVersion(filename, version, function (filenameWithVersion) {
                            incorrectProvider.deleteFile(self.username, filenameWithVersion, function (err) {
                                //TODO: Is deleting of an non-existing file an error too?
                                if (err)
                                    return callback(err);

                                incorrectProvider.createFile(self.username, filenameWithVersion, correctData, callback);
                            });
                        });
                    }, function (err) {
                        //TODO: Should we return an error if recreating fails?
                        fn(null, correctData);
                    });
                } else {
                    console.log('All files corrupted');
                    return fn('All files corrupted');
                }
            });
        });
    });
};

StorageManagerRaid1.prototype.deleteFile = function (filename, version, fn) {
    var self = this;

    self.collection(function (err, collection) {
        if (err)
            return fn(err);

        collection.findOne({
            username: self.username,
            filename: filename,
            version: version
        }, function (err, file) {
            if (err) {
                console.log("Error: " + err);
                return fn(err);
            }
            if (!file) {
                console.log("Error: File does not exist");
                return fn('File does not exist');
            }

            console.log("file with version found");

            self.forEachProvider(function (provider, callback) {
                console.log("provider: " + provider.type + " in deletion progress");
                self.createFilenameWithVersion(filename, version, function (filenameWithVersion) {
                    provider.deleteFile(self.username, filenameWithVersion, callback);
                });
            }, function (err) {
                if (err)
                    return fn(err);

                collection.remove({
                    username: self.username,
                    filename: filename,
                    version: version
                }, fn);
            });
        });
    });
};

StorageManagerRaid1.prototype.createFilenameWithVersion = function (filename, version, fn) {
    var fileNameWithoutExtension, extension, filenameWithVersion;

    if (filename.indexOf(".") !== -1) {
        fileNameWithoutExtension = filename.substring(0, filename.length - 4);
        extension = filename.substring(filename.length - 4, filename.length);
    } else {
        fileNameWithoutExtension = filename;
        extension = "";
    }
    filenameWithVersion = fileNameWithoutExtension + '_' + version + extension;

    fn(filenameWithVersion);
};

module.exports = StorageManagerRaid1;
