'use strict';
const _ = require('lodash');
const isNumeric = require('isnumeric');
var validator = require('validator');
const promisify = require('es6-promisify');
const databaseManager = require('../databaseManager');

module.exports = function (bidRef,dealerRef,userId,interestedInBid) {

     if(bidRef !== null && interestedInBid === null)
     {
            
            return databaseManager.validateUserIdAndBidRef(bidRef,userId).then(response => {
                 if (_.isEmpty(response)) {
                        return Promise.resolve(buildValidationResult(false,
                                                                     'BidRef',
                                                                     `Could not find any bids which matches *${bidRef}* Please try again and make sure you have caps lock off`,
                                                                     null,null,null));
                  }
                  if(response.Item.userId !== userId)
                  {
                        return Promise.resolve(buildValidationResult(false,'BidRef',
                                                                     `:flushed: Bid Reference ${bidRef} does not belong to you. Enter your bid reference and try again`,
                                                                     null,null,null));
                  }
                  if(response.Item.is_active === 'N')
                  {
                       var nobidsmessage = `:flushed: Auction with reference number *${bidRef}* has been expired hence will not able to help any further with this.`;
                      return Promise.resolve(buildValidationResult(false,'BidRef',
                                                                     nobidsmessage,
                                                                     null,null,null));
                  }
                  return databaseManager.findBids(bidRef).then(response => {
                      if(response.Count === 0)
                      {
                        var nobidsmessage = `:flushed: hmm...I could not find any bids for reference *${bidRef}* your Car as of now  :disappointed:. I am sure we will have something for you soon`;
                        return Promise.resolve(buildValidationResult(false,'BidRef',
                                                                     nobidsmessage,
                                                                     null,null,null));
                      }
                      return Promise.resolve(buildValidationResult(true, null,null,null,null,null));
                  });
                  
            });
      }
      if(bidRef !== null && interestedInBid !== null && dealerRef === null)
      {
          if(interestedInBid.toLowerCase() !== 'n' && interestedInBid.toLowerCase() !== 'y')
          {
              return Promise.resolve(buildValidationResult(false,
                                                            'InterestedInBid',
                                                            `:confused: Sorry I didn't get that.Let me know if you interested or not by clicking one of the buttons below`,
                                                            'Express your interest by using given options',
                                                            'Click one of the options to proceed accordingly',true));
          }
      }
      if(dealerRef !== null)
      {
            return databaseManager.validateBidRefAndDealerRef(bidRef,dealerRef).then(response => {
                if (_.isEmpty(response)) {
                  return Promise.resolve(buildValidationResult(false,'DealerRef',
                                                                `:heavy_exclamation_mark: Could not find Bids against the Bid reference. Please try again and make sure you have caps lock off :smile:`,
                                                                null,null,null));
                }
                var filenames='';
                var isDealersBidExist;
                response.Items.forEach(function(item) {
                     if(item.dealer_name === dealerRef)
                     {
                        isDealersBidExist = true;

                     }
                });
                if(!isDealersBidExist)
                {
                     return Promise.resolve(buildValidationResult(false,'DealerRef',
                                                                `:heavy_exclamation_mark: Check the Dealer Reference Number *${dealerRef}* as I couldn't find any bid from this dealear for ${bidRef} \r\n Enter the valid Dealer Reference Number from above list and try again`,
                                                                null,null,null));
                }
                return Promise.resolve(buildValidationResult(true, null,null,null,null,null));
            });
      }
      return Promise.resolve(buildValidationResult(true,null,null,null,null,null));
};
function buildValidationResult(isValid, violatedSlot, messageContent,
                                responseCardTitle, responseCarSubtitle,isResponseCardRequired)
{
  if (messageContent === null) {
    return {
      isValid,
      violatedSlot,
      responseCardTitle,
      responseCarSubtitle,
      isResponseCardRequired
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
    responseCardTitle,
    responseCarSubtitle,
    isResponseCardRequired
  };
};
