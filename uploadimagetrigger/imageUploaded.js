'use strict';
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "bid-master-images";
module.exports = function (event) {
  
  var bucket = event.Records[0].s3.bucket.name;
  var filename = event.Records[0].s3.object.key;
  var UniqueRef = filename.substring(0,filename.indexOf("%24")); //%24 is $ sign and when filename has special characters its passed as UTF8
  const response = {message: 'A new file Named' + filename + ' was uploaded to the bucket ' + bucket + ' with unique ref ' + UniqueRef,event};
  var uuid1 = uuid.v1();

  var params = {
    TableName:table,
    Item:{
        "unique_id": uuid1,
        "bid_ref": UniqueRef,
        "filename":'https://s3.amazonaws.com/'+ bucket + '/' + filename
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });

}
