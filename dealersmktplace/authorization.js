'use strict';
var AWS = require('aws-sdk');
const request = require('request-promise');

module.exports = (code) => {
	console.log('Authorzation was called');
	const clientId = process.env.SLACK_CLIENT_ID;
	const clientSecret = process.env.SLACK_CLIENT_SECRET;
	const oauthURL = 'https://slack.com/api/oauth.access?' +
					'client_id=' + clientId + '&' +
					'client_secret=' + clientSecret + '&' +
					'code=' + code;
	const options = {
		url : oauthURL,
		json : true,
	};
	return request(options).then((response) => {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "dealer-market-place-tokens1";
			var chkMarket = "CarDealers";
			var securityToken = response.access_token;
			var params = {
		    	TableName:table,
		    	Key:{
		        	"market_place_type" : chkMarket
		    	},
		    	Item:{
		        	"market_place_type": chkMarket,
		        	"tokens":[{"security_token": securityToken }] // get value from OAuth Link
		    	}
			};//end of params
			docClient.get(params, function(err, data) {
		       	if(data === null || Object.keys(data).length === 0)
		       	{
		            console.log("Market Does Not Exists, so creating one now");
		            console.log("Adding a new item...");
		            docClient.put(params, function(err1, data1) {
		                if (err1) {
		                    console.error("Unable to add item. Error JSON:", JSON.stringify(err1, null, 2));
		                } else {
		                    console.log("Added item:", JSON.stringify(data1, null, 2));
		                }
		            });    
		        }
	        	else
	        	{
		            console.log("Seems like Market Exists, let's add one new then");
		            var updateRecParam = {
                        TableName:table,
                        Key:{
                            "market_place_type" : chkMarket
                        },
                        UpdateExpression: "set #tokenExists=list_append(if_not_exists(#tokenExists, :empty_list), :a)",
                        ExpressionAttributeNames: {
                             '#tokenExists': 'tokens'
                        },
                        ExpressionAttributeValues:{
                                    ":a":[{"security_token":securityToken}], //Make sure the Token is passed from OAuth API
                                    ':empty_list': []
                        },
                        ReturnValues:"UPDATED_NEW"
                    };
                    console.log(`Updating the item.with updated Param..${JSON.stringify(updateRecParam)}`);
                    docClient.update(updateRecParam, function(err2, data2) {
                           if (err2) {
                                console.error("Unable to update item. Error JSON:", JSON.stringify(err2, null, 2));
                            } else {
                                console.log("UpdateItem succeeded:", JSON.stringify(data2, null, 2));
                            }
                    });
		        }//end of else
			});//end of docClient.get
		});	
};
