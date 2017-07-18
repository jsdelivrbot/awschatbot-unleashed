'use strict';
const _ = require('lodash');
const isNumeric = require('isnumeric');
var validator = require('validator');
const promisify = require('es6-promisify');
const databaseManager = require('../databaseManager');

module.exports = function (bidRef,dealerRef,userId) {
     
     if(bidRef !== null && dealerRef === null)
     {
            return databaseManager.validateUserIdAndBidRef(bidRef,userId).then(response => {
            
                  if (_.isEmpty(response)) {
                        return Promise.resolve(buildValidationResult(false,
                                                                     'BidRef',
                                                                     `Could not find any bids which matches *${bidRef}* Please try again and make sure you have caps lock off :smile:`,
                                                                     null,null,null));   
                  }
                  if(response.Item.userId !== userId)
                  {
                         return Promise.resolve(buildValidationResult(false,'BidRef',
                                                                     `Bid Reference ${bidRef} does not belong to you hence please provide valid reference number`,
                                                                     null,null,null));   
                  }
                  return Promise.resolve(buildValidationResult(true, null,null,null,null,null));   
            });
      }
      
      if(dealerRef !== null)
      {
            return databaseManager.validateBidRefAndDealerRef(bidRef,dealerRef).then(response => {
                if (_.isEmpty(response)) {
                  return Promise.resolve(buildValidationResult(false,'DealerRef', 
                                                                `Could not find Bids against the Bid reference. Please try again and make sure you have caps lock off :smile:`,
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
                                                                `Please check the Dearler Ref number as I don't see any bids from *${dealerRef}* for Bid Reference ${bidRef}`,
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