var StorageProvider = require('./StorageProvider');
var util = require('util');
var credentials = null;

function StorageProviderBox(credentials) {
    this.credentials = credentials;
    this.authenticated = false;
}

util.inherits(StorageProviderBox, StorageProvider);

StorageProviderBox.prototype.type = 'box';
StorageProviderBox.prototype.displayName = 'Box';
StorageProviderBox.prototype.loginURL = 'http://www.box.com';
StorageProviderBox.prototype.logoFile = 'box.png';


StorageProviderBox.prototype.createFile = function(filename, path, fn) {
    console.log('File ' + filename + ' from path ' + path + ' successfully created at Provider Box');
    fn();
};
StorageProviderBox.prototype.readFile = function(filename, fn) {
    console.log('File ' + filename + ' read at Provider Box');
    fn('tmp/tmp_read_box');
};
StorageProviderBox.prototype.deleteFile = function(filename, fn) {
    console.log('File ' + filename + ' deleted at Provider Box');
    fn();
};
module.exports = StorageProviderBox;
