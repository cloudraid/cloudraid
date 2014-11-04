var StorageManager = require('./StorageManager');
var util = require('util');

function StorageManagerMemory() {
	StorageManager.call(this);
}

util.inherits(StorageManagerMemory, StorageManager);

StorageManager.prototype.type = 'memory';

module.exports = StorageManagerMemory;
