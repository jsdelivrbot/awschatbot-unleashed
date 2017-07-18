'use strict';

const qs = require('querystring');

module.exports = function (event) {
	invalidateBids(qs.parse(event.body));
}

function invalidateBids(request) {
    console.log("Started updating the Bids in DynamoDB");	
    var AWS = require('aws-sdk');
    var docClient = new AWS.DynamoDB.DocumentClient();
    var today=new Date().toISOString().substr(0,10);
    var table = "car-bid-master";
    console.log("Querying for bids that are to be marked as invalid.");
    
   var params = {
            TableName : table,
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
            
            var myupdate={
                        TableName:table,
                        Key:{
                            "bid_reference": item.bid_reference
                            },
                            UpdateExpression: "set is_active = :r",
                            ExpressionAttributeValues:{
                            ":r":"N"
                            },
                            ReturnValues:"UPDATED_NEW"
                        };
            console.log("Updating the item...");
            console.log(myupdate);
            
            docClient.update(myupdate, function(err, data1) {
             if (err) {
                        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                      } else {
                        console.log("UpdateItem succeeded:", JSON.stringify(data1, null, 2));
                      }
            });
                        
        });

        var response = {
	        	statusCode: 200,
	        	body: JSON.stringify(
	          	{
		            message: 'Updated the Bids'
	          	}),
      		};

		return response;    

    }
});
		
}; 
