const url = require('url');
const querystring = require('querystring');
const request = require('request-promise');
const date = require('date-and-time');
const databaseManager = require('../databaseManager');
const _ = require('lodash');

module.exports = function (bidRef,dealer_name) {

  console.log('Calling getCarBidDetails in Slack Factory');
  return databaseManager.getCarBidDetail(bidRef,dealer_name).then(response => {
      console.log(`CarBidDetai is ${JSON.stringify(response)}`);
      var bid_amount; 
      var dealerSlackId;
      response.Items.forEach(function(item) {
          dealerSlackId = item.dealer_reference;
          bid_amount =item.bid_amount;
          return false;
      });
      console.log(`After get CarBidDetails Dealer Slack Id is ${dealerSlackId} and Bid Amount by Dealer is ${bid_amount}`);
      return databaseManager.getCarBidMaster(bidRef).then(bidMasterResponse => {
           console.log(`bid master response is ${JSON.stringify(bidMasterResponse)}`);
           return databaseManager.getSlackTeamSecurityToken().then(securityTokenResponse => {
              var securityToken = securityTokenResponse.Items[0].security_token
              var url = "https://slack.com/api/im.list";
              var options = {
                method: 'POST',
                uri: url,
                form : {
                  token : securityToken
                },
                json: true,
              };
              var imID;
              var imUser;
              request(options).then((response) => {
                  console.log(`here are the ims ${JSON.stringify(response)}`);
                  console.log(`I am going to check if ${dealerSlackId} exist in ims or not`);
                  var ims = response.ims;
                  console.log(`Response.ims are ${JSON.stringify(ims)}`);
                  var channelId;
                  for(i in ims)
                  {
                      imID = ims[i].id;
                      imUser = ims[i].user;
                      if(imUser === dealerSlackId)
                      {
                        channelId = imID;
                        break;
                      }
                  }
                  var url = "https://slack.com/api/chat.postMessage";
                  var chatMessage = `Congratulations! Car Seller for Bid Reference ${bidRef} has shown interest in your bid. \r\n ` +
                                    `Here are the details \r\n` + 
                                    `Bid Reference - *${bidRef}* \r\n` +
                                    `Your Bid Amount - *INR.* ${bid_amount} \r\n` +
                                    `Car Seller Email Address - *${bidMasterResponse.Item.email_address}* \r\n` +
                                    `To ensure you close this transaction quickly, kindly reach out to a Car Seller at the earliest`;

                  var options = {
                    method: 'POST',
                    uri: url,
                    form : {
                      token : securityToken,
                      channel: channelId,
                      text: chatMessage,
                      as_user: false,

                    },
                    json: true,
                  };
                  request(options).then((response) => {
                      console.log(`After sending message to user the response is ${JSON.stringify(response)}`);
                      return Promise.resolve(`Hello world the channelId where message needs to be sent ${channelId}`);
                  });
              });//end of 1st
          });//end of 2nd
      });
  });
}
