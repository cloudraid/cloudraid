/**
 * Created by berger on 20.11.14.
 */
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';

var s3 = new AWS.S3();

var createbucket = function() {
    var params = {Bucket: 'g2-t2'};
    s3.headBucket(params, function (err, data) {
        if (!err) {
            console.log("Target Bucket exists and is accessible.");
        } else {
            if (err.message !== 'Missing credentials in config') {
                console.log("Bucket not found, creating a new one...");
                var params = {Bucket: 'g2-t2'};
                s3.createBucket(params, function (err, data) {
                    if (err) console.log(err, err.stack);
                    else     console.log("Bucket successfully created");
                });
            } else {
                console.error(err.name + " - " + err.message);
            }
        }
    });
};

var listbuckets = function() {
    s3.listBuckets(function(err, data) {
        for (var index in data.Buckets) {
            var bucket = data.Buckets[index];
            console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
        }
    });
};


var deletebucket = function() {
    var params = {Bucket: 'g2-t2'};
    s3.deleteBucket(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else     console.log("Bucket successfully deleted.");
    });
};

var putobject = function(key, body) {
    var params = {Bucket: 'g2-t2', Key: key, Body: body};
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
};

var getobject = function(key) {
    var params = {Bucket: 'g2-t2', Key: key};
    s3.getObject(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
          console.log(data);
          console.log(data.Body.toString());
      }
    });
};

//createbucket();
//deletebucket();
//listbuckets();
//putobject('mykey','mybodyinsidetheobject');
//getobject('mykey');