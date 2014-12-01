var StorageProvider = require('./StorageProvider');
var util = require('util');
var https = require('https');
var fs = require('fs');
var unirest = require('unirest');
var temp = require('temp');

temp.track();

var apiPath = 'https://api.box.com/2.0';

function StorageProviderBox(credentials) {
  this.credentials = credentials;

  StorageProviderBox.prototype.createHeader = function(args) {
    var accessToken = credentials.accessToken;
    var header = { 'Authorization' : 'Bearer ' +  accessToken};

    for(var key in args) {
      header[key] = args[key];
    }

    return header;
  }
}

util.inherits(StorageProviderBox, StorageProvider);

StorageProviderBox.prototype.type = 'box';


StorageProviderBox.prototype.setup = function(fn) {
  var self = this;
  self.log('Login with ' + this.credentials);

  self.getRootFolders(function(items) {
    if(items) {
      self.log("Successfully connected to Box");
    } else {
      self.log("Unable to connect to Box. Verify your credentials.");
    }
    fn(null);
  });
}

StorageProviderBox.prototype.createFile = function(username, file, data, fn) {
  var self = this;


  self.getRootFolderByName(username, function(folderId) {
    if(folderId) {
      //Unirest accepts only file paths, so we have to temporarily store
      //the data in a file
      temp.open('CloudRaid', function(err, info) {
        fs.writeFile(info.path, data, function(err) {

          unirest.post('https://upload.box.com/api/2.0/files/content')
          .headers(self.createHeader())
          .field('attributes', JSON.stringify({name: file, parent: {id: folderId}}))
          .attach('file', info.path)
          .end(function (response) {
             switch(response.status) {
                case 201:
                  self.log("File uploaded successfully. ID = " + response.body.entries[0].id);
                  fn();
                  break;
                case 409:
                  self.log("File already exists. Attempting to update...");
                  self.updateFile(username, file, data, fn);
                  break;
                default:
                  self.log("Code "+response.status);
                  fn();
             }
           });
        });
      });
  } else {
      self.log("Unable to create file: Could not access folder '"+username+"'");
      fn();
    }
  });
}

StorageProviderBox.prototype.updateFile = function(username, file, data, fn) {
  var self = this;

  self.getRootFolderByName(username, function(folderId) {
    if(folderId) {
      //Unirest accepts only file paths, so we have to temporarily store
      //the data in a file
      temp.open('CloudRaid', function(err, info) {
        fs.writeFile(info.path, data, function(err) {
          self.findFileByName(folderId, file, function(fileID) {
            if(fileID) {
              unirest.post('https://upload.box.com/api/2.0/files/' + fileID + '/content')
              .headers(self.createHeader())
              .field('attributes', JSON.stringify({name: file, parent: {id: folderId}}))
              .attach('file', info.path)
              .end(function (response) {
                 switch(response.status) {
                    case 201:
                        self.log("File updated successfully. ID = " + response.body.entries[0].id);
                        break;
                    default:
                        self.log("Code "+response.status);
                 }
                 fn();
               });
            } else {
              self.log("Unable to find file '"+file+"'");
              fn(null);
            }
          });
        });
      });
    } else {
      self.log("Unable to update file: Could not access folder '"+username+"'");
      fn(null);
    }
  });
}

StorageProviderBox.prototype.readFile = function(username, file, fn) {
  var self = this;

  self.getRootFolderByName(username, function(folderId) {
    if(folderId) {
      self.findFileByName(folderId, file, function(fileID) {
        if(fileID) {
          unirest.get(apiPath + '/files/' + fileID + '/content')
          .headers(self.createHeader())
          .encoding('binary')
          .end(function (response) {
            fn(null, new Buffer(response.body, 'binary'));
          });
        } else {
          self.log("Unable to find file '"+file+"'");
          fn(null);
        }
      });
    } else {
      self.log("Unable to read file: Could not access folder '"+username+"'");
      fn(null);
    }
  });
};

StorageProviderBox.prototype.deleteFile = function(username, file, fn) {
  var self = this;

  self.getRootFolderByName(username, function(folderId) {
    if(folderId) {
      self.findFileByName(folderId, file, function(fileID) {
        if(fileID) {
          unirest.delete(apiPath + '/files/' + fileID)
          .headers(self.createHeader())
          .end(function (response) {
            if(response.status === 204) {
              self.log("File deleted successfully.");
            } else {
              self.log("Unable to delete file. Error "+response.status);
            }
            fn();
          });
        } else {
          self.log("Unable to find file '"+file+"'");
          fn(null);
        }
      });
    } else {
      self.log("Unable to delete file: Could not access folder '"+username+"'");
      fn(null);
    }
  });
}


StorageProviderBox.prototype.createFolder = function(args, fn) {
  var self = this;
  var folderId = 0;

  var parent = (args.parent ? args.parent : 0);
  var data = JSON.stringify({name: args.folderName, parent: {id: parent}});

  unirest.post(apiPath + '/folders')
  .headers(self.createHeader({
    'Content-Type': 'application/json',
    'Content-Length': data.length }))
  .send(data)
  .end(function (response) {
    switch(response.status) {
      case 201:
        self.log("Successfully created folder '"+args.folderName + "'. ID: "+response.body.id);
        fn(response.body.id);
        break;
      case 409:
        self.log("Folder '" + args.folderName + "' already exists in this directory");
        fn(response.body.context_info.conflicts[0].id);
        break;
      default:
        self.log("Unable to create folder. Error " + response.status)
        fn(null);
    }
  });
}

StorageProviderBox.prototype.getRootFolderByName = function(rootFolderName, fn) {
  this.getRootFolders(function(items) {
    if(!items) {
      return fn(null);
    }

    var folderId;

    items.forEach(function(item) {
      if(item.name === rootFolderName) {
        folderId = item.id;
      }
    });

    if(!folderId) {
      StorageProviderBox.prototype.createFolder({folderName: rootFolderName}, function(folderId) {
        folderId = folderId;
        fn(folderId);
      });
    } else {
      fn(folderId);
    }
  });
}

StorageProviderBox.prototype.getRootFolders = function(fn) {
  var self = this;

  self.getFolderContent(0, function(items) {
    if(items) {
      fn(items.filter(function(item) {return item.type === 'folder';}));
    } else {
      self.log("Unable to read root folders");
      fn(null);
    }
  })
}

StorageProviderBox.prototype.getFolderContent = function(folderId, fn) {
  var self = this;

  unirest.get(apiPath + '/folders/' + folderId + '/items')
  .headers(self.createHeader())
  .end(function (response) {
    if(response.status === 200) {
      fn(response.body.entries);
    } else {
      self.log("Unable to read content of folder " + folderId + ". Error "+response.status);
      fn(null);
    }
  });
}

StorageProviderBox.prototype.findFileByName = function(folderId, file, fn) {
  this.getFolderContent(folderId, function(items) {
    var id = null;

    if(items) {
      items.forEach(function(item) {
        if(item.name === file) {
          id = item.id;
        }
      });
    }
    fn(id);
  });
}

module.exports = StorageProviderBox;
