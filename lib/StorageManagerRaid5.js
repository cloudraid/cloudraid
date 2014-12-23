var StorageManager = require('./StorageManager');
var async = require('async');
var database = require('./database');
var util = require('util');

function StorageManagerRaid5(username, settings) {
  StorageManager.call(this, username, settings);
}

util.inherits(StorageManagerRaid5, StorageManager);

StorageManagerRaid5.prototype.fileList = function(fn) {
  var self = this;

  self.collection(function(err, collection) {
    if (err)
      return fn(err);

    collection.find({
      username: self.username
    }).toArray(fn);
  });
};

StorageManagerRaid5.prototype.createFile = function(filename, data, fn) {

  var self = this;
  self.collection(function(err, collection) {
    if (err)
      return fn(err);

    collection.find({
      username: self.username,
      filename: filename
    }).toArray(function (err, items) {
      if(items == null) {
        var version = 1;
      }else {
        var version = items.length + 1;
      }

      console.log('Data length: ' + data.length);

      var firstPartOfData = [];
      var secondPartOfData = [];

      for(var i in data) {
          console.log(i);
      }

      self.providers[2].createFile('admin', 'first.jpg', firstPartOfData, function() {});
     // self.providers[1].createFile('admin', 'second', secondPartOfData, function() {});

      /*self.calculateHash(data, function (err, hash) {
        if (err)
          return fn(err);
        var providers = self.providers;

        self.forEachProvider(function (provider, callback) {
          self.createFilenameWithVersion(filename, version, function(filenameWithVersion) {
            provider.createFile(self.username, filenameWithVersion, data, callback);
          });
        }, function (err) {
          if (err)
            return fn(err);

          collection.update(
              {
                username: self.username,
                filename: filename,
                version: version
              },
              {
                $set: {
                  size: data.length,
                  insertDate: new Date(),
                  hash: hash
                }
              }, {upsert: true}, fn);
        });
      });
      */
    });
  });
};

StorageManagerRaid5.prototype.readFile = function(filename, version, fn) {
  var self = this;

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
};

StorageManagerRaid5.prototype.deleteFile = function(filename, fn) {
  var self = this;

  self.collection(function(err, collection) {
    if (err)
      return fn(err);

    self.forEachProvider(function(provider, callback) {
      provider.deleteFile(self.username, filename, callback);
    }, function(err) {
      if (err)
        return fn(err);

      collection.remove({
        username: self.username,
        filename: filename
      }, fn);
    });
  });
};

StorageManagerRaid5.prototype.createFilenameWithVersion = function(filename, version, fn) {
  var fileNameWithoutExtension = filename.substring(0, filename.length - 4);
  var extension = filename.substring(filename.length - 4, filename.length);
  var filenameWithVersion = fileNameWithoutExtension + '_' + version + extension;
  fn(filenameWithVersion);
};

module.exports = StorageManagerRaid5;
