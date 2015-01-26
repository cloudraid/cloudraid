var StorageProvider = require('./StorageProvider');
var util = require('util');
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';


function StorageProviderAmazon(credentials, settingsCallback) {
    var creds = new AWS.Credentials();
    creds.accessKeyId = credentials.key;
    creds.secretAccessKey = credentials.secret;
    AWS.config.credentials = creds;

    this.bucket = 'g2-t2';
    this.s3 = new AWS.S3(AWS.config);
}

util.inherits(StorageProviderAmazon, StorageProvider);

StorageProviderAmazon.prototype.type = 'amazon';

StorageProviderAmazon.prototype.setup = function(fn) {
    this.log('Login with ' + this.credentials);
    fn(null);
};

StorageProviderAmazon.prototype.createFile = function(path, file, data, fn) {
    var self = this;
    var params = {Bucket: this.bucket, Key: path+"/"+file, Body: data};
    this.s3.putObject(params, function(err, data) {
        if (err)
            self.log(err, err.stack);
        else
            self.log('File ' + file + ' successfully created.');
        fn(err);
    });
};

StorageProviderAmazon.prototype.readFile = function(path, file, fn) {
    var self = this;
    var params = {Bucket: this.bucket, Key: path+"/"+file};
    this.s3.getObject(params, function(err, data) {
        if (err) {
            self.log(err, err.stack);
            fn(null);
        } else {
            self.log('File ' + file + ' read');
            fn(null, data.Body);
        }
    });
};

StorageProviderAmazon.prototype.deleteFile = function(path, file, fn) {
    var self = this;
    var params = {Bucket: this.bucket, Key: path+"/"+file};
    this.s3.deleteObject(params, function(err, data) {
        if (err)
            self.log(err, err.stack);
        else {
            self.log('File ' + file + ' deleted');
        }
        fn(err);
    });
};

module.exports = StorageProviderAmazon;
