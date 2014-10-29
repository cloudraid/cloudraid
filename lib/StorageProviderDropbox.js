var StorageProvider = require('./StorageProvider');
var util = require('util');
var credentials = null;
function StorageProviderDropbox(credentials) {
    this.credentials = credentials;
}

util.inherits(StorageProviderDropbox, StorageProvider);

StorageProvider.prototype.type = 'amazon';
StorageProviderDropbox.prototype.createFile = function(filename, path) {
    console.log("File " + filename + " successfully created at Provider Dropbox");
};

module.exports = StorageProviderDropbox;
