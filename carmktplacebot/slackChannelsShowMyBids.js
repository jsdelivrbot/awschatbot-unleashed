const url = require('url');
const querystring = require('querystring');
const request = require('request-promise');
const date = require('date-and-time');
const databaseManager = require('../databaseManager');
const _ = require('lodash');

module.exports = function (bidRef,dealer_name) {
 
  return databaseManager.getCarBidDetail(bidRef,dealer_name).then(response => {
      var bid_amount; 
      var dealerSlackId;
      response.Items.forEach(function(item) {
          dealerSlackId = item.dealer_reference;
          bid_amount =item.bid_amount;
          return false;
      });
      return databaseManager.getCarBidMaster(bidRef).then(bidMasterResponse => {
           return databaseManager.getCarMarketPlaceSecurityTokens().then(securityTokenResponse => {
               var counter = 0;
                securityTokenResponse.forEach(function(item) { 
                      var securityToken = item.security_token;
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
                      //start of Req-1
                      request(options).then((response) => {
                            var ims = response.ims;
                            var channelId;
                            var haveIFoundTheChannel = false;
                            for(i in ims)
                            {
                                imID = ims[i].id;
                                imUser = ims[i].user;
                                if(imUser === dealerSlackId)
                                {
                                  channelId = imID;
                                  haveIFoundTheChannel = true;
                                  break;
                                }
                            }
                            if(haveIFoundTheChannel)
                            {
                                  var url = "https://slack.com/api/chat.postMessage";
                                  var chatMessage = `:star2: Congratulations! :thumbsup: Car Seller for Bid Reference *${bidRef}* has shown interest in your bid. \r\n ` +
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
                                      return Promise.resolve(`Hello world the channelId where message needs to be sent ${channelId}`);
                                  });  
                            }//end of If
                     });//end of Req-1
                 });//end of  securityTokenResponse.forEach(function(item) 
              });//end of 2nd
            });
        });
  }
