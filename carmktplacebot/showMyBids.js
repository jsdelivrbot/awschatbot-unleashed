'use strict';
const _ = require('lodash');
const lexResponses = require('./lexResponses');
const databaseManager = require('../databaseManager');
const validator = require('./validateShowMyBids');
const slackChannelFactory = require('./slackchannels');
const slackController = require('./slackChannelsShowMyBids');
module.exports = function(intentRequest) {
    const slots = intentRequest.currentIntent.slots;
    var bidRef = intentRequest.currentIntent.slots.BidRef;
    var interestedInBid = intentRequest.currentIntent.slots.InterestedInBid;
    var dealerRef = intentRequest.currentIntent.slots.DealerRef;
    var sessionAttributes = intentRequest.sessionAttributes;
    var userId = intentRequest.userId;
    const source = intentRequest.invocationSource;


    if (source === 'DialogCodeHook')
    {
        return validator(bidRef,dealerRef,userId,interestedInBid).then((validationResult) => {
           if (!validationResult.isValid)
            {
                 var isSessionAttributeEmpty = _.isEmpty(sessionAttributes);
                 if(!isSessionAttributeEmpty)
                 {
                    if(sessionAttributes.violatedSlot === validationResult.violatedSlot)
                    {
                        sessionAttributes = {};
                        var fulfilmentResponse = lexResponses.buildFulfilmentResult('Fulfilled', 'I wish I could help you  :disappointed: but unfortunately with provided details, I will not be able to proceed any further. \n Thank you for your visit and Have a Great Day!');
                        return Promise.resolve(lexResponses.close(sessionAttributes,
                                                                    fulfilmentResponse.fullfilmentState,
                                                                    fulfilmentResponse.message));
                    }

                }
                var responseCard;
                if(validationResult.isResponseCardRequired)
                {
                  var options = lexResponses.buildOptions(validationResult.violatedSlot);
                  responseCard = lexResponses.buildResponseCard(validationResult.responseCardTitle,
                                                                validationResult.responseCarSubtitle,
                                                                options);
                }// end of if(validationResult.isResponseCardRequired)

                slots[`${validationResult.violatedSlot}`] = null;
                sessionAttributes = {};
                sessionAttributes.violatedSlot = validationResult.violatedSlot;
                var response = lexResponses.elicitSlot(sessionAttributes,
                                                        intentRequest.currentIntent.name,
                                                        slots,
                                                        validationResult.violatedSlot,
                                                        validationResult.message,
                                                        responseCard);
                var strResponse = JSON.stringify(response);
                return Promise.resolve(response);
            }//end of validation.isValid

            if(bidRef !== null && interestedInBid === null)
            {
                var options = lexResponses.buildOptions('InterestedInBid');
                var responseCard = lexResponses.buildResponseCard('Let me know if you Interested in any of the Bids',
                                                                  'Click one of the options to proceed accordingly',
                                                                  options);
                return processRequest(bidRef,userId).then(response => {
                    var message = { contentType: 'PlainText', content: `${response}`};
                    return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes,
                                                                    intentRequest.currentIntent.name,
                                                                    intentRequest.currentIntent.slots,
                                                                    'InterestedInBid',
                                                                    message,
                                                                    responseCard));
                });
            }
            if(bidRef !== null && interestedInBid !== null && dealerRef === null)
            {
                if(interestedInBid.toLowerCase() === 'y')
                {
                    var message = { contentType: 'PlainText', content: ' :thumbsup: Sounds Cool, Enter the Dealer Reference number from the bid you are interested in'};
                    intentRequest.sessionAttributes = {};
                    return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes,
                                                                      intentRequest.currentIntent.name,
                                                                      intentRequest.currentIntent.slots,
                                                                      'DealerRef',
                                                                      message,
                                                                      null));
                }
                else {
                    var fulfilmentResponse = lexResponses.buildFulfilmentResult('Fulfilled', 'Sure No problem :thumbsup:. I am just around the corner, will see you next time  :simple_smile:');
                    intentRequest.sessionAttributes = {};
                    return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes,
                                                              fulfilmentResponse.fullfilmentState,
                                                              fulfilmentResponse.message));
                }
            }
            return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes,
                                                        intentRequest.currentIntent.slots));
        });
     }
     if (source === 'FulfillmentCodeHook')
     {
          /* return slackController(bidRef,dealerRef).then((dealerSlackIdResponse) =>{
                console.log('AFTER SENDING DIRECT message to DEALER888888888888888888888');
                console.log(`Am I able to find the Dealer for Direct Message ${JSON.stringify(dealerSlackIdResponse)}`);
           });*/
           var message = `Thanks, I have informed the *${dealerRef}* about your interest  :sparkles: :sparkles:. You should expect a communication from them soon :clap: \r\n Have a Great Day! ahead and bye for now`;
           var fullfiledOrder = lexResponses.buildFulfilmentResult('Fulfilled', message);
           return Promise.resolve(lexResponses.close(sessionAttributes,
                                    fullfiledOrder.fullfilmentState,
                                    fullfiledOrder.message));
     }
};
function processRequest(bidRef,userId) {
    return databaseManager.validateUserIdAndBidRef(bidRef,userId).then(response1 => {
        var isAuctionActive = response1.Item.is_active;
        return databaseManager.findBids(bidRef).then(response => {
            var message = 'Going good...';
            var message1 = 'We have received ';
            var message2 = ' Bids so far :smile:. Here are the bid details alongwith the *Dealer Reference Number* ' + '\r\n \r\n';
            var message3 = '';
            var nobidsmessage = `hmm...I could not find any bids for reference ${bidRef} your Car as of now  :disappointed:. I am sure we will have something for you soon`;
            var counter = 0;
            response.Items.forEach(function(item) {
                counter++;
                message3 +=  counter + '. Dealer Reference - *' + item.dealer_name + '* Bid Amount is - *INR.' + item.bid_amount + '*' + '\r\n';
            });
            if(counter > 0)
            {
                var finalmsg = message + message1 + "*" + counter + "*" + message2 + message3;
                if(isAuctionActive === 'N')
                {
                    finalmsg += `Please note Auction with reference : ${bidRef} has been *Expired*`;
                }
                return finalmsg;
            }
            else
            {
               return nobidsmessage;
            }
    });
  }).catch(error => {
        return `hmm...I could not find any bids for your Car as of now. Pls check if you provided correct Bid Reference Number *${bidRef}*`;
  });
}
function buildFulfilmentResult(fullfilmentState, messageContent) {
  return {
      fullfilmentState,
      message: { contentType: 'PlainText', content: messageContent }
  };
}
