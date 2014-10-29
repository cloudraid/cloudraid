var StorageProvider = require('./StorageProvider');
var util = require('util');
var credentials = null;
function StorageProviderBox(credentials) {
    this.credentials = credentials;
}

util.inherits(StorageProviderBox, StorageProvider);

StorageProvider.prototype.type = 'amazon';
StorageProviderBox.prototype.createFile = function(filename, path) {
    console.log("File " + filename + " successfully created at Provider Box");
};

module.exports = StorageProviderBox;
