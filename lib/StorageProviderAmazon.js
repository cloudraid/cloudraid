var StorageProvider = require('./StorageProvider');
var util = require('util');
var credentials = null;
function StorageProviderAmazon(credentials) {
    this.credentials = credentials;
}

util.inherits(StorageProviderAmazon, StorageProvider);

StorageProviderAmazon.prototype.type = 'amazon';
StorageProviderAmazon.prototype.createFile = function(file, data, fn) {
    this.log('File ' + file + ' successfully created');
    fn();


    /*
var params = {
  Bucket: 'STRING_VALUE',
  Key: 'STRING_VALUE',

};
s3.putObject(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

    */
};
StorageProviderAmazon.prototype.readFile = function(file, fn) {
    this.log('File ' + file + ' read');
    fn('tmp/tmp_read_amazon');
};
StorageProviderAmazon.prototype.deleteFile = function(file, fn) {
    this.log('File ' + file + ' deleted');
    fn();
};
module.exports = StorageProviderAmazon;
