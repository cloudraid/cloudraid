var StorageProvider = require('./StorageProvider');
var util = require('util');
var credentials = null;

function StorageProviderDropbox(credentials) {
    this.credentials = credentials;
    this.authenticated = false;
}

util.inherits(StorageProviderDropbox, StorageProvider);

StorageProviderDropbox.prototype.type = 'dropbox';
StorageProviderDropbox.prototype.displayName = 'Dropbox';
StorageProviderDropbox.prototype.loginURL = 'http://www.dropbox.com';
StorageProviderDropbox.prototype.logoFile = 'dropbox.png';


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
