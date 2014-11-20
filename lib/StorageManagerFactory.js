var StorageProviderFactory = require('./StorageProviderFactory');
var StorageManagerMemory = require('./StorageManagerMemory');
var StorageManagerRaid1 = require('./StorageManagerRaid1');

module.exports.create = function(username, settings, fn) {
  try {
    var json = JSON.parse(settings);

    if (json.type === 'memory')
      return fn(null, new StorageManagerMemory());
    if (json.type === 'raid1')
      return fn(null, new StorageManagerRaid1(username, json.providers));

    fn(null, null);
  } catch (ex) {
    fn(ex, null);
  }
};
