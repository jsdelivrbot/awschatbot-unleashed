'use strict';
var AWS = require('aws-sdk');
const databaseManager = require('../databaseManager');
const request = require('request-promise');
var docClient = new AWS.DynamoDB.DocumentClient();

module.exports = function (event) {
	invalidateBids();
  archiveChannels();
}
function archiveChannels(){

    console.log("archiveChannels called ***************************"); 
    var table = "dealer-market-place-tokens1";
    var chkMarket = "CarDealers";
    var paramsQuery = {
      TableName : table,
      KeyConditionExpression: "#market = :markettype",
      ExpressionAttributeNames:{
          "#market": "market_place_type"
      },
      ExpressionAttributeValues: {
          ":markettype":'CarDealers'
      }
    };
    docClient.query(paramsQuery, function(err, securityTokensData) {
          console.log(`Security token which we got within archive channel are ${JSON.stringify(securityTokensData)}`);
          var today=new Date().toISOString().substr(0,10);
          console.log("Querying for bids that are to be marked as invalid.");
          var params = {
              TableName : "channel-details",
              IndexName : "channel_expiry_date-index", // This was missing in main code
              KeyConditionExpression: "#valid = :getdate",
              ExpressionAttributeNames:{
                  "#valid": "channel_expiry_date"
              },
              ExpressionAttributeValues: {
                 ":getdate": today
             }
          };
          docClient.query(params, function(err, archiveChannelsData) {
              console.log(`Hurray Archived channel list ${JSON.stringify(archiveChannelsData)}`);
              securityTokensData.Items[0].tokens.forEach(function(item)   {
                    archiveChannelsData.Items.forEach(function(channelDetail){
                          console.log(`Running Archivval request for security_token ${JSON.stringify(item.security_token)} and channel id ${JSON.stringify(channelDetail.channel_id)}`);
                          var url = "https://slack.com/api/channels.archive";
                          var options = {
                              method: 'POST',
                              uri: url,
                              form : {
                                  token : item.security_token,
                                  channel: channelDetail.channel_id
                              },
                              json: true,
                          };
                          request(options).then((response) => {
                              if(response.ok === true)
                              {
                                    /*console.log(`Deleting Channel ${channelDetail.channel_id}`);
                                    var table = "channel-details";
                                    var params = {
                                        TableName:table,
                                        Key:{
                                            "channel_id":channelDetail.channel_id
                                        },
                                        ConditionExpression:"channel_id = :val",
                                        ExpressionAttributeValues: {
                                            ":val": channelDetail.channel_id
                                        }
                                    };
                                    console.log("Attempting a conditional delete...");
                                    docClient.delete(params, function(err, data) {
                                          console.log(`After Channel Delete request ${JSON.stringify(data)}`);
                                    });*/
                              }
                         });
                    });
              });
          });
          
    });
   
}
function invalidateBids() {
    console.log("Checking bids which have to Expire***************************");	
    var today=new Date().toISOString().substr(0,10);
    console.log("Querying for bids that are to be marked as invalid.");
    var params = {
        TableName : "car-bid-master",
        IndexName : "auction_end_date-index", // This was missing in main code
        KeyConditionExpression: "#valid = :getdate",
        ExpressionAttributeNames:{
            "#valid": "auction_end_date"
        },
        ExpressionAttributeValues: {
            ":getdate": today
        }
    };
    docClient.query(params, function(err, data) {
        if (err) {
            console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            data.Items.forEach(function(item) {
                console.log(" -", item.bid_reference + ": " + item.auction_create_date
                + " ... " + item.auction_end_date
                + " ... " + item.number_of_days);
               var params = {
                      TableName: "car-bid-master",
                      Key:{
                        "bid_reference": item.bid_reference
                      },
                      UpdateExpression: "set is_active = :r",
                      ExpressionAttributeValues:{
                        ":r":"N"
                      },
                        ReturnValues:"UPDATED_NEW"
                }; 
                docClient.update(params, function(err, data) {
                     if (err) {
                        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                     } else {
                        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                     }
                });
            });
        }
    });
}    