var crypto = require('crypto');
var engine = require('tingodb')({});

var db = new engine.Db('', {});
var dbo = null;
module.exports.settings = {};

function getCachedDb(fn) {
  if (dbo)
    return fn(null, dbo);

  db.open(function(err, db) {
    dbo = db;

    db.collection('settings', function(err, settings) {
      settings.findOne({}, function(err, settingsObj) {
        if (settingsObj) {
          module.exports.settings = settingsObj;
          return fn(err, db);
        }

        settingsObj = module.exports.settings;
        settingsObj.salt = crypto.randomBytes(64).toString();

        console.warn('Creating new databse ...');
        module.exports.hashPassword('admin', 'admin', function(hash) {
          settings.insert(settingsObj);
          db.collection('users', function(err, users) {
            users.insert({
              username: 'admin',
              name: 'Administrator',
              isadmin: true,
              hash: hash,
              settings: '{}'
            });
          });

          return fn(err, db);
        });
      });
    });
  });
}

module.exports.collection = function(name, fn) {
  getCachedDb(function(err, db) {
    dbo.collection(name, fn);
  });
};

module.exports.hashPassword = function(username, password, fn) {
  fn(username + ':' + this.settings.salt + ':' + password);
};
