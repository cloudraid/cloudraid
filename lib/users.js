var crypto = require('crypto');
var database = require('./database');

function collection(fn) {
  database.collection('users', fn);
}

function hashPassword(username, password, fn) {
  fn(username + ':' + database.settings.salt + ':' + password);
}

function encryptSettings(settings, password, fn) {
  fn(settings);
}

function decryptSettings(settings, password, fn) {
  fn(settings);
}

module.exports = {
  add: function(username, password, name, isadmin, fn) {
    hashPassword(username, password, function(hash) {
      encryptSettings('', hash+password, function(settings) {
        collection(function(err, collection) {
          collection.insert({
            username: username,
            name: name,
            isadmin: isadmin,
            hash: hash,
            settings: settings
          }, fn);
        });
      });
    });
  },
  remove: function(username, fn) {
    collection(function(err, collection) {
      collection.remove({username: username}, fn);
    });
  },
  checkCredentials: function(username, password, fn) {
    collection(function(err, collection) {
      collection.findOne({username:username}, function(err, user) {
        if (!user)
          return fn(null);

        hashPassword(username, password, function(hash) {
          if (user.hash !== hash)
            return fn(null);

          decryptSettings(user.settings, hash+password, function(settings) {
            fn({
              username: username,
              name: user.name,
              isadmin: !!user.isadmin,
              settings: settings
            });
          });
        });
      });
    });
  },
  list: function(fn) {
    collection(function(err, collection) {
      collection.find({}).toArray(fn);
    });
  },
  update: function(username, oldPassword, newPassword, name, settings, fn) {
    collection(function(err, collection) {
      collection.findOne({username:username}, function(err, user) {
        if (!user)
          return fn('User does not exist');

        hashPassword(username, oldPassword, function(oldHash) {
          if (oldHash !== user.hash) {
            fn('Invalid Password');
          } else {
            hashPassword(username, newPassword, function(newHash) {
              encryptSettings(settings, newHash+newPassword, function(settings) {
                collection.update({username:username}, {
                  $set: {
                    name: name,
                    hash: newHash,
                    settings: settings
                  }
                }, fn);
              });
            });
          }
        });
      });
    });
  }
};
