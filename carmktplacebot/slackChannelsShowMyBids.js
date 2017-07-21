const url = require('url');
const querystring = require('querystring');
const request = require('request-promise');
const date = require('date-and-time');
const databaseManager = require('../databaseManager');
const _ = require('lodash');

module.exports = function (bidRef,dealer_name) {

  console.log('Calling getCarBidDetails in Slack Factory');
  //getCarBidMaster(bidRef);
  //return databaseManager.getCarBidDetail(bidRef,dealer_name).then(response => {
  //  console.log(`CarBidDetai is ${JSON.stringify(response)}`);
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
            var options = {
              method: 'POST',
              uri: url,
              form : {
                token : securityToken,
                channel: channelId,
                text: 'This is amazig feeling as you have got the confirmation from Car sell',
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
  //  });
}
