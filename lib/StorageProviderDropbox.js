var StorageProvider = require('./StorageProvider');
var util = require('util');
var credentials = null;
function StorageProviderDropbox(credentials) {
    this.credentials = credentials;
}

util.inherits(StorageProviderDropbox, StorageProvider);

StorageProviderDropbox.prototype.type = 'dropbox';
StorageProviderDropbox.prototype.createFile = function(filename, path, fn) {
    console.log('File ' + filename + ' from path ' + path + ' successfully created at Provider Dropbox');
    fn();
};
StorageProviderDropbox.prototype.readFile = function(filename, fn) {
    console.log('File ' + filename + ' read at Provider Dropbox');
    fn('tmp/tmp_read_dropbox');
};
StorageProviderDropbox.prototype.deleteFile = function(filename, fn) {
    console.log('File ' + filename + ' deleted at Provider Dropbox');
    fn();
};
module.exports = StorageProviderDropbox;
