'use strict';

const qs = require('querystring');
var AWS = require('aws-sdk');
const isNumeric = require("isnumeric");
const databaseManager = require('../databaseManager');

module.exports = function (event) {
   return acceptBid(qs.parse(event.body));
}
function acceptBid(request) {
  try{
      var verificationToken = 'xxxxxxxxxxxxxxxxxxxxxxxxx';
      var incomingVerificationToken = request.token;
      //both verificationToken and incomingVerificationToken must be same.

      console.log(request.text);
      console.log(request.user_name);
      console.log(request.channel_name);
      console.log(request.user_id);
      var jsonString = JSON.stringify(request);
      console.log(jsonString);
      var bidtext = request.text;
      var array = bidtext.split(" ");
      if(array.length < 2 || array.length > 2)
      {
          const response = {
            statusCode: 200,
            body: JSON.stringify({
              "message" : 'There is issue with your bid',
              "attachments": [
        				{
            			 "color": "#ed0707",
	        				 "text" : "You bid was not accepted as the format of your bid was incorrect :heavy_exclamation_mark: \n Send your bid in the following format /bidforcar <numeric value> <bid reference> \n e.g. /bidforcar 200000 ds57jwzgf7"
        				}
    				]
            }),
          };
          return Promise.resolve(response);
      }
      else {
      		var bidReference = array[1];
      		var dealerName = request.user_name;
      		var dealerSlackId = request.user_id;
      		var bidAmount = array[0];
          return checkValidBidReference(bidReference).then(response => {
              if(response.toLowerCase() === 'n')
              {
                  const response = {
                        statusCode: 200,
                        body: JSON.stringify({
                        "message": 'There is no such Bid Rerence number',
                        "attachments": [
                            {
                              "color": "#ed0707",
                              "text": ":heavy_exclamation_mark: " + bidReference + " is not a valid Bid reference number. \r\n Kindly check if you entered it correctly. \r\n Try again with valid Bid reference number  :point_up:"
                            }
                          ]
                        }),
                   };
                   return Promise.resolve(response);
              }
              else {
                  return checkAuctionValidity(bidReference).then((getBidDetails)=>{
                      if(getBidDetails.Item.is_active.toLowerCase() === 'n')
                      {
                          const response = {
                                statusCode: 200,
                                body: JSON.stringify({
                                "message": 'Sorry, Bid for The Car is already closed',
                                "attachments": [
                                    {
                                      "color": "#ed0707",
                                      "text": "Thanks for showing interest however we cannot process this bid now :heavy_exclamation_mark: \r\n as this auction has already been expired against Bid Reference " + bidReference
                                    }
                                  ]
                                }),
                           };
                           return Promise.resolve(response);
                       }
                       else
                       {
                            return recordBidSubmission(bidReference,dealerName,dealerSlackId,bidAmount).then(() =>{
                                const response = {
                                    statusCode: 200,
                                    body: JSON.stringify({
                                        "message": 'Bid for The Car is:' + request['text'] + ' posted by user:' + request['user_name'] + ' in Channel:' + request['channel_name'],
                                        "attachments": [
                                            {
                                              "color": "#36a64f",
                                              "text": "Cool :smile: Your Bid has been submitted successfully  :clap: \r\n \r\n Bid Reference : " + array[1] + " \r\n Your Bid INR. " + array[0] + "\r\n We will inform you by sending a Direct Message if seller is interested in your Bid. \r\n\r\n Please note - You can resubmit your Bid whie Auction is live."
                                            }
                        ]
                                    }),
                                };
                                return Promise.resolve(response);
                            });
                       }
                  });
                }
        });
      	/*	return recordBidSubmission(bidReference,dealerName,dealerSlackId,bidAmount).then(() =>{
      			const response = {
              				statusCode: 200,
              				body: JSON.stringify({
                			"message": 'Bid for The Car is:' + request['text'] + ' posted by user:' + request['user_name'] + ' in Channel:' + request['channel_name'],
                			"attachments": [
        						{
            						"color": "#36a64f",
	        						"text": "Cool :smile: Your Bid for Car reference : " + array[1] + " for INR. " + array[0] + " has been recorded successfully for seller to look at. \n \n Expect a reply if seller is interested. \n \n In case you like to bid again you are allowed until bid is closed."
        						}
    						]
              			}),
          		};
          		return Promise.resolve(response);
      		});*/

      }
  }catch(err) {
      Promise.reject(err);
  }
};
function checkValidBidReference(bidReference){
  return databaseManager.checkValidBidReference(bidReference);
}
function recordBidSubmission(bidReference,dealerName,dealerSlackId,bidAmount){
	return databaseManager.recordBidSubmission(bidReference,dealerName,dealerSlackId,bidAmount);
}
function checkAuctionValidity(bidReference){
  return databaseManager.checkValidityOfAuction(bidReference);
}
