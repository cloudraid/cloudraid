var StorageProvider = require('./StorageProvider');
var util = require('util');

function StorageProviderBox(credentials) {
    this.credentials = credentials;
    this.authenticated = false;
}

util.inherits(StorageProviderBox, StorageProvider);

StorageProviderBox.prototype.type = 'box';


StorageProviderBox.prototype.setup = function(fn) {
    this.log('Login with ' + this.credentials);
    fn(null);
};

StorageProviderBox.prototype.createFile = function(file, data, fn) {
    this.log('File ' + file + ' successfully created');
    fn();


// Example
/*curl https://upload.box.com/api/2.0/files/content \
  -H "Authorization: Bearer ACCESS_TOKEN" -X POST \
  -F attributes='{"name":"tigers.jpeg", "parent":{"id":"11446498"}}' \
  -F file=@myfile.jpg
*/

};
StorageProviderBox.prototype.readFile = function(file, fn) {
    this.log('File ' + file + ' read');
    fn(null, 'DATA from Box');
};
StorageProviderBox.prototype.deleteFile = function(file, fn) {
    this.log('File ' + file + ' deleted');
    fn();
};
module.exports = StorageProviderBox;
