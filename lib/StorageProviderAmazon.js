var StorageProvider = require('./StorageProvider');
var util = require('util');
var credentials = null;

function StorageProviderAmazon(credentials) {
    this.credentials = credentials;
    this.authenticated = false;
}

util.inherits(StorageProviderAmazon, StorageProvider);

StorageProviderAmazon.prototype.type = 'amazon';
StorageProviderAmazon.prototype.displayName = 'Amazon S3';
StorageProviderAmazon.prototype.loginURL = 'http://www.amazon.com';
StorageProviderAmazon.prototype.logoFile = 'amazon.png';


StorageProviderAmazon.prototype.createFile = function(filename, path, fn) {
    console.log('File ' + filename + ' from path ' + path + ' successfully created at Provider Amazon');
    fn();
};
StorageProviderAmazon.prototype.readFile = function(filename, fn) {
    console.log('File ' + filename + ' read at Provider Amazon');
    fn('tmp/tmp_read_amazon');
};
StorageProviderAmazon.prototype.deleteFile = function(filename, fn) {
    console.log('File ' + filename + ' deleted at Provider Amazon');
    fn();
};
module.exports = StorageProviderAmazon;
