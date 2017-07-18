'use strict';

const lexResponses = require('./lexResponses');
const databaseManager = require('../databaseManager');

module.exports = function(intentRequest) {
    var bidRef = intentRequest.currentIntent.slots.BidRef;
    var dealerRef = intentRequest.currentIntent.slots.DealerRef;
    var userId = intentRequest.userId;
    const source = intentRequest.invocationSource;    
    for (var key in intentRequest.currentIntent.slots) {
        if (intentRequest.currentIntent.slots.hasOwnProperty(key)) {
                console.log(`Slot key name is ${key}`);
        }
    }
    console.log(`Invoation Source is ----------------- ${source}`);
    if (source === 'DialogCodeHook') {
        console.log(`inside showmybids bidRef : ${bidRef}`);
        console.log(`inside showmybids dealerRef : ${dealerRef}`);
        console.log(`inside showmybids userId : ${userId}`);
        if(bidRef)
        {
           console.log('Inside processing request for bidref');
            return processRequest(bidRef,userId).then(response => {
                //return lexResponses.close(intentRequest.sessionAttributes, fullfiledRequest.fullfilmentState, fullfiledRequest.message);
                console.log(`response from Show bids process request is ${response}`);
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
    }    
};
function processRequest(bidRef,userId) {
    return databaseManager.validateUserIdAndBidRef(bidRef,userId).then(response1 => {
        console.log(`After calling validateUserIdAndBidRef I have got ${JSON.stringify(response1)}`);
        var isAuctionActive = response1.Item.is_active;
        return databaseManager.findBids(bidRef).then(response => {
            console.log('fullfilRequest invoked with');
            var message = 'Going good...';
            var message1 = 'We have received ';
            var message2 = ' Bids so far :smile:. Here are the bid details along Dealer Reference Number for your consideration ' + '\r\n \r\n';
            var message3 = '';
            var nobidsmessage = `hmm...I could not find any bids for reference ${bidRef} your Car as of now. I am sure we will have something for you soon`;
            var counter = 0;
            response.Items.forEach(function(item) {
                counter++;
                message3 +=  counter + '. Dealer Reference - *' + item.dealer_name + '* Bid Amount is - *INR.' + item.bid_amount + '*' + '\r\n \r\n';
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
                    finalmsg += `If you like any of the bids for your Car and pursue discussion further, I can share your *email address* with them \r\n`;
                    finalmsg += `Please mention *Dealer Reference* number from bid and I will do the needful`;   
                }
                console.log('sending final message with bid details are ' + finalmsg);
                //return buildFulfilmentResult('Fulfilled', finalmsg);
                return finalmsg;
            }
            else
            {
                console.log('Sending final message with NO bids ' + nobidsmessage);
                return nobidsmessage;
            }  
    });  
  }).catch(error => {
        console.log(`Inside Error Block of validateUserIdAndBidRef ${error}`);
        return `hmm...I could not find any bids for your Car as of now. Pls check if you provided correct Bid Reference Number *${bidRef}*`; 
  });
}
function buildFulfilmentResult(fullfilmentState, messageContent) {
  return {
      fullfilmentState,
      message: { contentType: 'PlainText', content: messageContent }
  };
}




