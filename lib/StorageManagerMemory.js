var StorageManager = require('./StorageManager');
var util = require('util');

function StorageManagerMemory() {
}

util.inherits(StorageManagerMemory, StorageManager);

StorageManager.prototype.type = 'memory';

module.exports = StorageManagerMemory;
