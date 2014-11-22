function StorageProvider() {
}

StorageProvider.prototype.type = 'unknown';
StorageProvider.prototype.log = function(s) {
	console.log(this.type + ": " + s);
};

module.exports = StorageProvider;
