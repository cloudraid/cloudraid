var StorageManager = require('./StorageManager');
var util = require('util');

function StorageManagerMemory() {
  StorageManager.call(this);

  this.files = {
    'a.txt': 'AA',
    'b.txt': 'BB'
  };
}

util.inherits(StorageManagerMemory, StorageManager);

StorageManagerMemory.prototype.setup = function(fn) {
  fn(null);
};

StorageManagerMemory.prototype.fileList = function(fn) {
  var ret = [];

  for (var filename in this.files) {
    ret.push({
      filename: filename
    });
  }

  fn(null, ret);
};

StorageManagerMemory.prototype.createFile = function(filename, data, fn) {
  this.files[filename] = data;
  fn(null);
};

StorageManagerMemory.prototype.readFile = function(filename, fn) {
  fn(null, this.files[filename]);
};

StorageManagerMemory.prototype.deleteFile = function(filename, fn) {
  delete this.files[filename];
  fn(null);
};

module.exports = StorageManagerMemory;
