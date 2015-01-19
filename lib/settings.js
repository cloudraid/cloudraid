var crypto = require('crypto');
var database = require('./database');
var algorithm = 'aes-256-ctr';

function collection(fn) {
  database.collection('appSettings', fn);
}

function encryptSettings(settings, password, fn) {
  var cipher = crypto.createCipher(algorithm, password);
  var encrypted = cipher.update(settings,'utf8', 'base64');
  encrypted += cipher.final('base64');
  fn(encrypted);
}

function decryptSettings(settings, password, fn) {
  var decipher = crypto.createDecipher(algorithm, password);
  var decrypted = decipher.update(settings, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  fn(decrypted);
}

module.exports = {
  read: function(fn) {
    collection(function(err, collection) {
      collection.findOne({}, function(err, data) {
        console.log("data: "+JSON.stringify(data));
        if(data) {
          fn(data.settings);
        } else {
          fn(data);
        }
      });
    });
  },

  update: function(settings, fn) {
    collection(function(err, collection) {
      collection.update(
      {
        settings: {$exists: true}
      },
      {
        settings: settings
      },
      {
        upsert: true
      }, fn);
    });
  }
}