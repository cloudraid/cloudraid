var StorageManager = require('./StorageManager');
var async = require('async');
var database = require('./database');
var util = require('util');

function StorageManagerRaid1(username, settings) {
  StorageManager.call(this, username, settings);
}

util.inherits(StorageManagerRaid1, StorageManager);

StorageManagerRaid1.prototype.fileList = function(fn) {
  var self = this;

  self.collection(function(err, collection) {
    if (err)
      return fn(err);

    collection.find({
      username: self.username
    }).toArray(fn);
  });
};

StorageManagerRaid1.prototype.createFile = function(filename, data, fn) {
  var self = this;
  self.collection(function(err, collection) {
    if (err)
      return fn(err);

    self.calculateHash(data, function(err, hash) {
      if (err)
        return fn(err);

      self.forEachProvider(function(provider, callback) {
        provider.createFile(self.username, filename, data, callback);
      }, function(err) {
        if (err)
          return fn(err);

        collection.update(
          {
            username: self.username,
            filename: filename
          },
          {
            $set: {
                    size: data.length,
                    insertDate: new Date(),
                    hash: hash
                  }
          }, { upsert: true }, fn);
      });
    });
  });
};

StorageManagerRaid1.prototype.readFile = function(filename, fn) {
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

StorageManagerRaid1.prototype.deleteFile = function(filename, fn) {
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

module.exports = StorageManagerRaid1;
