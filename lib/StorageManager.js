var StorageProviderFactory = require('./StorageProviderFactory');
var async = require('async');
var crypto = require('crypto');
var database = require('./database');

function StorageManager(username, settings) {
  this.username = username;
  this.settings = settings;
  this.providers = [];
}

StorageManager.prototype.collection = function(fn) {
  database.collection('files', fn);
};

StorageManager.prototype.setup = function(fn) {
  var self = this;
  this.providers = [];
  async.each(this.settings, function(settings, callback) {
    StorageProviderFactory.create(settings, function(err, provider) {
      if (err)
        return callback(err);
      self.providers.push(provider);
      provider.setup(callback);
    });
  }, fn);
};

StorageManager.prototype.forEachProvider = function(iterator, callback) {
  async.each(this.providers, iterator, callback);
};

StorageManager.prototype.calculateHash = function(data, fn) {
  var hash = crypto.createHash('md5');
  hash.update(data, 'utf8')
  fn(null, hash.digest('hex'));
};

StorageManager.prototype.updateFile = function(filename, data, fn) {
  var self = this;
  this.deleteFile(filename, function(err) {
    if (err)
      return fn(err);
    self.createFile(filename, data, fn);
  });
};

module.exports = StorageManager;
