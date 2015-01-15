var StorageManager = require('./StorageManager');
var async = require('async');
var util = require('util');

function StorageManagerRaid5(username, settings) {
    StorageManager.call(this, username, settings);
}

util.inherits(StorageManagerRaid5, StorageManager);

StorageManagerRaid5.prototype.createFile = function (filename, data, fn) {
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

            var data1 = data.slice(0, data.length / 2);
            var data2 = data.slice(data.length / 2, data.length);
            var parityData = new Buffer(data.length / 2);

            for (var i = 0; i < Math.floor(data.length / 2); i++) {
                var parity = data1.readUInt8(i) ^ data2.readUInt8(i);
                parityData.writeUInt8(parity, i);
            }
            if (data1.length !== data2.length)
                parityData.writeUInt8(data2.readUInt8(data2.length - 1), data2.length - 1);

            var dataArray = [data1, data2, parityData];
            var hashArray = new Array(3);
            var providerArray = new Array(3);

            var providerNumber = 0;

            self.forEachProvider(function (provider, callback) {
                self.calculateHash(dataArray[providerNumber], function (err, hash) {
                    if (err)
                        return fn(err);

                    hashArray[providerNumber] = hash;
                    providerArray[providerNumber] = provider;

                    self.createFilenameWithVersion(filename, version, providerNumber, function (filenameWithVersion) {
                        provider.createFile(self.username, filenameWithVersion, dataArray[providerNumber], callback);
                    });
                });

                providerNumber++;

            }, function (err) {
                if (err)
                    return fn(err);

                collection.insert([
                    {
                        username: self.username,
                        filename: filename,
                        version: version,
                        providerType0: providerArray[0].type,
                        hash0: hashArray[0],
                        providerType1: providerArray[1].type,
                        hash1: hashArray[1],
                        providerType2: providerArray[2].type,
                        hash2: hashArray[2],
                        size: data.length,
                        insertDate: new Date()
                    }], fn);
            });
        });
    });
};

StorageManagerRaid5.prototype.readFile = function (filename, version, fn) {
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

            var dataArray = new Array(3);
            var isCorrectData = new Array(3);
            var providerArray = new Array(3);
            var numberOfCorrectData = 0;

            self.forEachProvider(function (provider, callback) {
                var numberArray = [0, 1, 2];
                async.each(numberArray, function (number, callbackNumber) {
                    if (provider.type === file['providerType' + number]) {
                        self.createFilenameWithVersion(filename, version, number, function (filenameWithVersion) {
                            provider.readFile(self.username, filenameWithVersion, function (err, data) {
                                self.calculateHash(data, function (err, hash) {
                                    if (err)
                                        return callback(err);
                                    isCorrectData[number] = (hash === file['hash' + number]);
                                    if (hash === file['hash' + number]) {
                                        numberOfCorrectData++;
                                    }
                                    dataArray[number] = data;
                                    callbackNumber(null);
                                    callback(null);
                                });
                            });
                        });
                        providerArray[number] = provider;
                    } else {
                        callbackNumber(null);
                    }
                });
            }, function (err) {
                if (err)
                    return fn(err);

                if (numberOfCorrectData >= 2) {
                    if (numberOfCorrectData === 2) {
                        if (isCorrectData[0] && isCorrectData[1]) {
                            self.calculateMissingDataAndUpdate(dataArray[0], dataArray[1], dataArray[2], filename, version, 2, file, providerArray[2], function (err, correctedData) {
                                var data = Buffer.concat([dataArray[0], dataArray[1]]);
                                fn(null, data);
                            });
                        } else if (isCorrectData[0] && isCorrectData[2]) {
                            self.calculateMissingDataAndUpdate(dataArray[0], dataArray[2], dataArray[1], filename, version, 1, file, providerArray[1], function (err, correctedData) {
                                var data = Buffer.concat([dataArray[0], correctedData]);
                                fn(null, data);
                            });
                        } else {
                            self.calculateMissingDataAndUpdate(dataArray[1], dataArray[2], dataArray[0], filename, version, 0, file, providerArray[0], function (err, correctedData) {
                                var data = Buffer.concat([correctedData, dataArray[1]]);
                                fn(null, data);
                            });
                        }
                    } else {
                        var data = Buffer.concat([dataArray[0], dataArray[1]]);
                        fn(null, data);
                    }
                } else {
                    console.log('All files corrupted');
                    return fn('All files corrupted');
                }

            });

        /*
        if (isCorrectData[0] && isCorrectData[1]) {
          if (isCorrectData[2]) {
            fn(null, dataArray[2]);
          } else {
            //Recover data 2
            var correctData = Buffer.concat(new Array(dataArray[0], dataArray[1]));

            self.createFilenameWithVersion(filename, version, 2, function (filenameWithVersion) {
              providerArray[2].deleteFile(self.username, filenameWithVersion, function (err) {
                providerArray[2].createFile(self.username, filenameWithVersion, correctData, function() {});
              });
              fn(null, correctData);
            });
          }
        }else if(isCorrectData[2]) {
          self.createFilenameWithVersion(filename, version, 0, function(filenameWithVersion) {
            providerArray[0].deleteFile(self.username, filenameWithVersion, function (err) {
              providerArray[0].createFile(self.username, filenameWithVersion, dataArray[2].slice(0,file.size/2), function() {});
            });
          });
          self.createFilenameWithVersion(filename, version, 1, function(filenameWithVersion) {
            providerArray[1].deleteFile(self.username, filenameWithVersion, function (err) {
              providerArray[1].createFile(self.username, filenameWithVersion, dataArray[2].slice(file.size / 2, file.size), function () {
              });
            });
          });
          fn(null, dataArray[2]);
        }else{
          console.log('All files corrupted');
          return fn('All files corrupted');
        }
         */


      /*
       self.collection(function(err, collection) {
       if (err)
       return fn(err);

       collection.findOne({
       username: self.username,
       filename: filename
       }, function(err, file) {
       if (err)
       return fn(err);
       if (!file)
       return fn('File does not exist');

       var correctData = null;
       var correctHash = file.hash;
       var incorrectProviders = [];
       self.forEachProvider(function(provider, callback) {

       provider.readFile(self.username, filename, function(err, data) {
       if (err)
       return callback(err);

       self.calculateHash(data, function(err, hash) {
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
       }, function(err) {
       if (err)
       return fn(err);

       if (correctData) {
       async.forEach(incorrectProviders, function(incorrectProvider, callback) {
       console.log('Incorrect file at Provider ' + incorrectProvider.type);
       incorrectProvider.deleteFile(self.username, filename, function(err) {
       //TODO: Is deleting of an non-existing file an error too?
       if (err)
       return callback(err);

       incorrectProvider.createFile(self.username, filename, correctData, callback);
       });
       }, function(err) {
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
       */
        });
    });
};

StorageManagerRaid5.prototype.deleteFile = function (filename, version, fn) {
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
                for (var i = 0; i <= 2; i++) {
                    if (provider.type === file['providerType' + i]) {
                        self.createFilenameWithVersion(filename, version, i, function (filenameWithVersion) {
                            provider.deleteFile(self.username, filenameWithVersion, callback);
                        });
                    }
                }
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

StorageManagerRaid5.prototype.createFilenameWithVersion = function (filename, version, partNumber, fn) {
    var fileNameWithoutExtension, extension, filenameWithVersion;

    if (filename.indexOf(".") !== -1) {
        fileNameWithoutExtension = filename.substring(0, filename.length - 4);
        extension = filename.substring(filename.length - 4, filename.length);
    } else {
        fileNameWithoutExtension = filename;
        extension = "";
    }
    filenameWithVersion = fileNameWithoutExtension + '_' + version + '_' + partNumber + extension;

    fn(filenameWithVersion);
};

StorageManagerRaid5.prototype.calculateMissingDataAndUpdate = function (data1, data2, wrongData, filename, version, partNumber, file, provider, fn) {
    var self = this;
    var correctedData;
    if (file.size % 2 === 0 || data1.length !== data2.length)
        correctedData = new Buffer(file.size / 2);
    else
        correctedData = new Buffer(file.size / 2 - 1);

    for (var i = 0; i < data1.length; i++) {
        var parity = data1.readUInt8(i) ^ data2.readUInt8(i);
        correctedData.writeUInt8(parity, i);
    }
    if (data1.length !== data2.length)
        correctedData.writeUInt8(data2.readUInt8(data2.length - 1), data2.length - 1);

    self.createFilenameWithVersion(filename, version, partNumber, function (filenameWithVersion) {
        provider.deleteFile(self.username, filenameWithVersion, function (err) {
            provider.createFile(self.username, filenameWithVersion, correctedData, function () {
                fn(null, correctedData);
            });
        });
    });
};


module.exports = StorageManagerRaid5;
