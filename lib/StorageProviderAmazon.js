var StorageProvider = require('./StorageProvider');
var util = require('util');
var credentials = null;
function StorageProviderAmazon(credentials) {
    this.credentials = credentials;
}

util.inherits(StorageProviderAmazon, StorageProvider);

StorageProviderAmazon.prototype.type = 'amazon';
StorageProviderAmazon.prototype.createFile = function(filename, path) {
    console.log("File " + filename + " successfully created at Provider Amazon");
};

module.exports = StorageProviderAmazon;
