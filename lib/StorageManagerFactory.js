var StorageManagerMemory = require('./StorageManagerMemory');

module.exports.create = function(settings, fn) {
  try {
    var json = JSON.parse(settings);

    if (json.type === 'memory')
      return fn(null, new StorageManagerMemory());

    fn(null, null);
  } catch (ex) {
    fn(ex, null);
  }
};
