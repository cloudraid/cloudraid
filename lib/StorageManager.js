var StorageProviderFactory = require('./StorageProviderFactory');
var async = require('async');
var crypto = require('crypto');
var database = require('./database');
var settings = require('../lib/settings');

function StorageManager(username, settings) {
  this.username = username;
  this.settings = settings;
  this.providers = [];
}

StorageManager.prototype.collection = function(fn) {
  database.collection('files', fn);
};

StorageManager.prototype.updateSettings = function(fn) {
  var self = this;
  console.log("Saving modified settings: "+JSON.stringify(self.settings));
  settings.update(JSON.stringify(self.settings), fn)
};

StorageManager.prototype.setup = function(fn) {
  var self = this;
  this.providers = [];

  async.each(self.settings.providers, function(providerSettings, callback) {
    StorageProviderFactory.create(providerSettings, function(f) {
      self.updateSettings(f);
    },
      function(err, provider) {
        if (err)
          return callback(err);
        self.providers.push(provider);
        provider.setup(callback);
      }
    );
  }, fn);
};


StorageManager.prototype.fileList = function (fn) {
    var self = this;

    self.collection(function (err, collection) {
        if (err)
            return fn(err);

        collection.find({
            username: self.username
        }).toArray(fn);
    });
};

StorageManager.prototype.forEachProvider = function(iterator, callback) {
  this.providers.shuffle();
  async.each(this.providers, iterator, callback);
};


function arrayShuffle(){
  var tmp, rand;
  for(var i =0; i < this.length; i++){
    rand = Math.floor(Math.random() * this.length);
    tmp = this[i];
    this[i] = this[rand];
    this[rand] =tmp;
  }
}

Array.prototype.shuffle =arrayShuffle;

StorageManager.prototype.calculateHash = function(data, fn) {
  if(!data) {
    fn(null, null);
  }
  else {
    var hash = crypto.createHash('md5');
    hash.update(data, 'utf8');
    fn(null, hash.digest('hex'));
  }
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
