var StorageProvider = require('./StorageProvider');
var util = require('util');

function StorageProviderDropbox(credentials) {
    this.credentials = credentials;
}

util.inherits(StorageProviderDropbox, StorageProvider);

StorageProviderDropbox.prototype.type = 'dropbox';

StorageProviderDropbox.prototype.setup = function(fn) {
    this.log('Login with ' + this.credentials);
    fn(null);
};

StorageProviderDropbox.prototype.createFile = function(file, data, fn) {
    this.log('File ' + file + ' successfully created');
    fn();


    /* client.writeFile("hello_world.txt", "Hello, world!\n", function(error, stat) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert("File saved as revision " + stat.versionTag);
});

*/
};
StorageProviderDropbox.prototype.readFile = function(file, fn) {
    this.log('File ' + file + ' read');
    fn(null, 'DATA from Dropbox');
};
StorageProviderDropbox.prototype.deleteFile = function(file, fn) {
    this.log('File ' + file + ' deleted');
    fn();
};
module.exports = StorageProviderDropbox;
