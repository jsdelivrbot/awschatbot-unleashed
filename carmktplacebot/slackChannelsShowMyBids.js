const url = require('url');
const querystring = require('querystring');
const request = require('request-promise');
const date = require('date-and-time');
const databaseManager = require('../databaseManager');
const _ = require('lodash');

module.exports = function (bidRef,dealer_name) {
  return databaseManager.validateBidRefAndDealerRef(bidRef,dealer_name).then(response => {
        console.log(`Inside slackChannelsShowMyBids and the response I have recieved is ${JSON.stringify(response)}`);
        var dealerSlackIdResponse = {};
        var dealerSlackId;
        if (_.isEmpty(response)) {
          dealerSlackIdResponse.isValid = 'n';
          return Promise.resolve(dealerSlackIdResponse);
        }
        response.Items.forEach(function(item) {
             if(item.dealer_name === dealer_name)
             {
                dealerSlackId = item.dealer_reference;
                return false;
             }
        });
        dealerSlackIdResponse.isValid = 'y';
        dealerSlackIdResponse.dealer_reference = dealerSlackId
        console.log(`I have been able to find the dealer stack reference ${JSON.stringify(dealerSlackIdResponse)}`);

        return databaseManager.getSlackTeamSecurityToken().then(securityTokenResponse => {
            console.log(`Car Market Place security Token is ${JSON.stringify(securityTokenResponse)}`);
            console.log(`Here is the security toke ${securityTokenResponse.Items[0].security_token}`);
            var securityToken = securityTokenResponse.Items.security_token
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
                for( im in ims)
                {
                    imID = im.id;
                    imUser = im.user;
                    if(imUser === dealerSlackId)
                    {
                      console.log('Hurrayyyyyyyyyyyyyyyyy fdound the match');
                    }
                }
                return Promise.resolve('Hello world');
             });
          });//end of return get slacksecutirytoken
        });//end of validateBidRefAndDealerRef
}
