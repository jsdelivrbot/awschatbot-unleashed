'use strict';
const _ = require('lodash');
const lexResponses = require('./lexResponses');
const databaseManager = require('../databaseManager');
const validator = require('./validateShowMyBids');
const slackChannelFactory = require('./slackchannels');

module.exports = function(intentRequest) {
    const slots = intentRequest.currentIntent.slots;
    var bidRef = intentRequest.currentIntent.slots.BidRef;
    var dealerRef = intentRequest.currentIntent.slots.DealerRef;
    var sessionAttributes = intentRequest.sessionAttributes;
    var userId = intentRequest.userId;
    const source = intentRequest.invocationSource;    
    
    if (source === 'DialogCodeHook') 
    {
        return validator(bidRef,dealerRef,userId).then((validationResult) => {
           if (!validationResult.isValid)
            {
                 var isSessionAttributeEmpty = _.isEmpty(sessionAttributes);
                 if(!isSessionAttributeEmpty)
                 {
                    if(sessionAttributes.violatedSlot === validationResult.violatedSlot)
                    {
                        sessionAttributes = {};
                        var fulfilmentResponse = lexResponses.buildFulfilmentResult('Fulfilled', 'I wish I could help you but unfortunately with provided details, I will not be able to proceed any further. \n Thank you for your visit and Have a Great Day!');
                        return Promise.resolve(lexResponses.close(sessionAttributes,
                                                                    fulfilmentResponse.fullfilmentState,
                                                                    fulfilmentResponse.message));
                    }
                    
                }
                sessionAttributes = {};
                sessionAttributes.violatedSlot = validationResult.violatedSlot;
                var response = lexResponses.elicitSlot(sessionAttributes,
                                                        intentRequest.currentIntent.name,
                                                        slots,
                                                        validationResult.violatedSlot,
                                                        validationResult.message,
                                                        null);
                var strResponse = JSON.stringify(response);
                console.log(strResponse);
                return Promise.resolve(response);
            }
            if(bidRef != null && dealerRef === null)
            {
                return processRequest(bidRef,userId).then(response => {
                    var message = { contentType: 'PlainText', content: `${response}`};
                    return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes,
                                                                    intentRequest.currentIntent.name,
                                                                    intentRequest.currentIntent.slots,
                                                                    'DealerRef',
                                                                    message,
                                                                    null));
                });    
            }
            return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes,
                                                        intentRequest.currentIntent.slots));
        });
     } 
     if (source === 'FulfillmentCodeHook') 
     {
           var message = `Thanks, I have informed the *${dealerRef}* about your interest. You should expect a communication from them soon`;
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
            var message2 = ' Bids so far :smile:. Here are the bid details alongwith Dealer Reference Number for your consideration ' + '\r\n \r\n';
            var message3 = '';
            var nobidsmessage = `hmm...I could not find any bids for reference ${bidRef} your Car as of now. I am sure we will have something for you soon`;
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
                else
                {
                    finalmsg += `If you like any of the bids and like to pursue the discussion further please mention the *Dealer Reference* number`;
                    finalmsg += ' And I will share your *email address* with the respective dealer for him/her to contact you\r\n';
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





