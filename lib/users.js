var database = require('./database');

function collection(fn) {
  database.collection('users', fn);
}

function hashPassword(username, password, fn) {
  fn(username + ':' + database.settings.salt + ':' + password);
}

module.exports = {
  add: function(username, password, name, isadmin, fn) {
    hashPassword(username, password, function(hash) {
        collection(function(err, collection) {
          collection.insert({
            username: username,
            name: name,
            isadmin: isadmin,
            hash: hash,
          }, fn);
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

            fn({
              username: username,
              name: user.name,
              isadmin: !!user.isadmin,
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
  update: function(username, oldPassword, newPassword, name, fn) {
    collection(function(err, collection) {
      collection.findOne({username:username}, function(err, user) {
        if (!user)
          return fn('User does not exist');

        hashPassword(username, oldPassword, function(oldHash) {
          if (oldHash !== user.hash) {
            fn('Invalid Password');
          } else {
            hashPassword(username, newPassword, function(newHash) {
                collection.update({username:username}, {
                  $set: {
                    name: name,
                    hash: newHash,
                  }
                }, fn);
            });
          }
        });
      });
    });
  }
};
