var StorageManagerMemory = require('./StorageManagerMemory');
var StorageManagerRaid1 = require('./StorageManagerRaid1');
var StorageManagerRaid5 = require('./StorageManagerRaid5');

module.exports.create = function(username, raidmode, credentials, fn) {
  try {
    var json = JSON.parse(credentials);

    if (raidmode === 'memory')
      return fn(null, new StorageManagerMemory());
    if (raidmode === 'raid1')
      return fn(null, new StorageManagerRaid1(username, json));
    if (raidmode === 'raid5')
      return fn(null, new StorageManagerRaid5(username, json));

    fn(null, null);
  } catch (ex) {
    fn(ex, null);
  }
};
