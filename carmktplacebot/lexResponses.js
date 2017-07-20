'use strict';
module.exports.elicitSlot = function(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
            responseCard,
        },
    };
}

module.exports.confirmIntent = function(sessionAttributes, intentName, slots, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ConfirmIntent',
            intentName,
            slots,
            message,
            responseCard,
        },
    };
}

//module.exports.close = function(sessionAttributes, fulfillmentState, message, responseCard) {
module.exports.close = function(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}
module.exports.delegate = function(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}
module.exports.buildFulfilmentResult = function(fullfilmentState, messageContent) {
  return {
    fullfilmentState,
    message: { contentType: 'PlainText', content: messageContent }
  };
}
// Build a responseCard with a title, subtitle, and an optional set of options which should be displayed as buttons.
module.exports.buildResponseCard  = function(title, subTitle, options)
 {
     let buttons = null;
     if (options != null && options.length > 0)
     {
         buttons = [];
         for (let i = 0; i < Math.min(5, options.length); i++) {
             buttons.push(options[i]);
         }
     }
     return {
         contentType: 'application/vnd.amazonaws.card.generic',
         version: 1,
         genericAttachments: [{
             title,
             subTitle,
             buttons,
         }],
     };
 }
// Build a list of potential options for a given slot, to be used in responseCard generation.
module.exports.buildOptions = function(forSlot)
{
    console.log('inside buildOptions method in LexResponses');
    if (forSlot === 'CarKmDriven')
    {
      return [
          { text: '0-5000', value: '0-5000'},
          { text: '5000 - 20000', value: '5000 - 20000'},
          { text: '20000 - 50000', value: '20000 - 50000'},
          { text: '50000 - 200000', value: '50000 - 200000'},
          { text: '> 200000', value: 'More than 200000'},
      ];
    }
    else if (forSlot === 'NumberOfOwners')
    {
      return [
          { text: 'Only one, me', value: 1},
          { text: 'I am Second', value: 2},
          { text: 'Including me 3', value: 3},
      ];
    }
    else if (forSlot === 'NumberOfDays')
    {
      return [
          { text: 'In 3 Days', value: 3},
          { text: 'In 4 Days', value: 4},
          { text: 'In 5 Days', value: 5},
      ];
    }
    else if (forSlot === 'ImageUpload')
    {
      return [
          { text: 'Have Uploaded', value: 'Y'},
          { text: 'Have No Images', value: 'N'},
      ];
    }
    else if (forSlot === "InterestedInBid")
    {
      return [
          { text: 'Yes I like a Bid and Discuss Further', value: 'Y'},
          { text: 'Not Interested, Will wait for More Bids', value: 'N'},
      ];
    }
}
