var StorageProvider = require('./StorageProvider');
var util = require('util');
var Dropbox = require("dropbox");



function StorageProviderDropbox(credentials, settingsCallback) {
      this.credentials = credentials;
      this.authenticated = false;

        this.client = new Dropbox.Client({
        key: credentials.key,
        secret: credentials.secret ,
        token: credentials.token
    });


}


util.inherits(StorageProviderDropbox, StorageProvider);

StorageProviderDropbox.prototype.type = 'dropbox';

StorageProviderDropbox.prototype.setup = function(fn) {
    this.log('Login with ' + this.credentials);
    var self = this;
    this.client.authenticate(function (error, client) {
        if (error) {
            self.log( + error);
        }
        else {
            // The user authorized your app, and everything went well.
            self.authenticated = true;
            self.log( "user successfully logged in.");
        }

    });
    fn(null);
};

StorageProviderDropbox.prototype.createFile = function(username, file, data, fn) {
    var self = this;
    self.client.writeFile(username+"/"+file, data, function(error, stat) {
        if (error) {
            self.log(error);
        }
        else{
            self.log('File ' + file + ' successfully created');
        }
        fn();
    });

};


StorageProviderDropbox.prototype.readFile = function(username, file, fn) {
    var self = this;
    self.client.readFile(username+"/"+file, {buffer : true }, function(error, data) {
        if (error) {
            self.log(error);
            fn(null);
        }
        else {// data is a buffer instance holding the image.
            self.log('File ' + file + ' read');
            fn(null, data);
        }

    });
};


StorageProviderDropbox.prototype.deleteFile = function(username, file, fn) {
    var self = this;
    self.client.remove(username+"/"+file, function(error, stat){
    if (error) {
        self.log(error);
    }
    else{
        self.log('File ' + file + ' deleted');
    }
    fn();
});


};
module.exports = StorageProviderDropbox;
