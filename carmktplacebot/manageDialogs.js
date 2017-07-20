'use strict';
const date = require('date-and-time');
const lexResponses = require('./lexResponses');
const validator = require('./validation');
const databaseManager = require('../databaseManager');
const _ = require('lodash');
const shortid = require('uniqid');

module.exports = function(intentRequest) {

    const slots = intentRequest.currentIntent.slots;
    const imageUpload = slots.ImageUpload;
    const emailAddress = slots.EmailAddress;
    const carBrandName = slots.CarBrandName;
  	const carModel = slots.CarModel;
  	const carYearOfMake = slots.CarYearOfMake;
  	const carVariant = slots.CarVariant;
  	const carKmDriven = slots.CarKmDriven;
  	const carColor = slots.CarColor;
  	const numberOfOwners = slots.NumberOfOwners;
  	const carCity = slots.CarCity;
  	const shortDescription = slots.ShortDescription;
    const maximumSellingPrice = slots.MaximumSellingPrice;
    const confirmationStatus = intentRequest.currentIntent.confirmationStatus;
    const numberofDays = slots.NumberOfDays;
    const inputTranscript = intentRequest.inputTranscript;
    const source = intentRequest.invocationSource;
    var userId = intentRequest.userId;
    var sessionAttributes = intentRequest.sessionAttributes;

    var isSessionAttributeEmpty = _.isEmpty(sessionAttributes);
    var uniqueReferenceNumber;
    if(isSessionAttributeEmpty)
    {
       uniqueReferenceNumber = shortid.process();
       sessionAttributes = {};
       sessionAttributes.uniqueReferenceNumber = uniqueReferenceNumber.toLowerCase();
    }

    return validator(carBrandName,carModel,carYearOfMake,carVariant,carKmDriven,
                     carColor,numberOfOwners,carCity,shortDescription,numberofDays,
                     emailAddress,imageUpload,sessionAttributes.uniqueReferenceNumber).then((validationResult) => {


   /*
    If data is valid then remove all other session attributes except unique reference
    */
    if(validationResult.isValid)
    {
       var tempSessionAttributes = {};
       tempSessionAttributes.uniqueReferenceNumber = sessionAttributes.uniqueReferenceNumber;
       sessionAttributes = tempSessionAttributes;
    }// end of if(validationResult.isValid)


    if (!validationResult.isValid)
    {
      /*
      * this block below is checking if session attribute is non empty and contains violated slot which is
      * same as the slot which has again violated in validation then close the conversation as user
      * does not have a valid input for the slot.
      */

      //Change-10 for unique reference number in session attributes
      //if(!isSessionAttributeEmpty)

      if(!isSessionAttributeEmpty && sessionAttributes.hasOwnProperty('violatedSlot'))
      {

           if(sessionAttributes.violatedSlot === validationResult.violatedSlot)
           {
              var fulfilmentResponse = lexResponses.buildFulfilmentResult('Fulfilled', 'I wish I could help you :disappointed: but unfortunately with provided details, I will not be able to proceed any further. \n Thank you for your visit and Have a Great Day!');
              intentRequest.sessionAttributes = {};
              return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes,
                                                        fulfilmentResponse.fullfilmentState,
                                                        fulfilmentResponse.message));
           }
      }//end of if(!isSessionAttributeEmpty)
      var responseCard;
      if(validationResult.isResponseCardRequired)
      {
        var options = lexResponses.buildOptions(validationResult.violatedSlot);
        responseCard = lexResponses.buildResponseCard(validationResult.responseCardTitle,
                                             validationResult.responseCarSubtitle,
                                              options);
      }// end of if(validationResult.isResponseCardRequired)
      slots[`${validationResult.violatedSlot}`] = null;

      //Change-10 for unique reference number in session attributes
      //sessionAttributes = {};

      sessionAttributes.violatedSlot = validationResult.violatedSlot;
      var response = lexResponses.elicitSlot(sessionAttributes,
                                              intentRequest.currentIntent.name,
                                              slots,
                                              validationResult.violatedSlot,
                                              validationResult.message,
                                              responseCard);
      var strResponse = JSON.stringify(response);
      return Promise.resolve(response);
    }//end of  if (!validationResult.isValid)
    //*************************End of Validation*********************************


    if(confirmationStatus !== 'Confirmed' && confirmationStatus !== 'Denied')
    {
       if(carBrandName !== null && carModel !== null && carYearOfMake !== null &&
              carVariant !== null && carKmDriven === null)
          {
             var options = lexResponses.buildOptions('CarKmDriven');
              responseCard = lexResponses.buildResponseCard('Specify Car Km Driven',
                                               'Choose one of the options or mention exact figure',
                                               options);
              var message = { contentType: 'PlainText', content: 'Please mention number of *Kms Car has been Driven* so far \n choose one of the options or mention Km Driven figure e.g. 45677' };
              var response = lexResponses.elicitSlot(sessionAttributes,
                                                    intentRequest.currentIntent.name,
                                                    slots,
                                                    'CarKmDriven',
                                                    message,
                                                    responseCard);
              var strResponse = JSON.stringify(response);
              return Promise.resolve(response);
          }//end of ElicitSlot response for Car Km Driven
          if(carBrandName !== null && carModel !== null && carYearOfMake !== null &&
             carVariant !== null && carKmDriven !== null && carColor !== null && numberOfOwners === null)
          {
              var options = lexResponses.buildOptions('NumberOfOwners');
              responseCard = lexResponses.buildResponseCard('Specify Number of Owners',
                                               'Choose one of the options below or Mention number in the message box below',
                                               options);
              var message = { contentType: 'PlainText', content: 'Please mention *Number of Owners* your Car have had so far \n Choose one of the options or mention number below in the message box'};
              var response = lexResponses.elicitSlot(sessionAttributes,
                                                    intentRequest.currentIntent.name,
                                                    slots,
                                                    'NumberOfOwners',
                                                    message,
                                                    responseCard);
              var strResponse = JSON.stringify(response);
              return Promise.resolve(response);
          }//end of ElicitSlot response for Number of Owners
          if(carBrandName !== null && carModel !== null && carYearOfMake !== null &&
             carVariant !== null && carKmDriven !== null && carColor !== null &&
             numberOfOwners !== null && carCity !== null && shortDescription !== null &&
             maximumSellingPrice !== null && numberofDays === null)
          {
              var options = lexResponses.buildOptions('NumberOfDays');
              responseCard = lexResponses.buildResponseCard('Specify Number of Days for Auction Expire',
                                                        'Choose one of the options below or mention number in the message box below',
                                                        options);
              var message = { contentType: 'PlainText', content: 'I generally recommend to keep Auction open for *3 Days* however you may select any option below \n Choose one of the options below'};
              var response = lexResponses.elicitSlot(sessionAttributes,
                                                    intentRequest.currentIntent.name,
                                                    slots,
                                                    'NumberOfDays',
                                                    message,
                                                    responseCard);
              var strResponse = JSON.stringify(response);
              return Promise.resolve(response);
          }//end of ElicitSlot response for Number of Owners*/
          if(carBrandName !== null && carModel !== null && carVariant !== null &&
             carColor !== null && carYearOfMake !== null && carKmDriven !== null &&
             numberOfOwners !== null && maximumSellingPrice !== null && carCity !== null &&
             shortDescription !== null && numberofDays !== null && imageUpload === null)
          {
              var options = lexResponses.buildOptions('ImageUpload');
              responseCard = lexResponses.buildResponseCard('Uplod Images of Your Car which increases chances for better price',
                                                        'Specify your input by selecting an option below',
                                                        options);
              var message = { contentType: 'PlainText', content: `To upload *Images* of your *Car* use ${sessionAttributes.uniqueReferenceNumber} reference number on the URL below.*Post Upload*, click *Have Uploaded* or *Have No Images* if you do not want.\r\n - https://marketplaceimages.herokuapp.com/`};
              var response = lexResponses.elicitSlot(sessionAttributes,
                                                    intentRequest.currentIntent.name,
                                                    slots,
                                                    'ImageUpload',
                                                    message,
                                                    responseCard);
              var strResponse = JSON.stringify(response);
              return Promise.resolve(response);
          }//end of ElicitSlot response for Number of Owners*/
          if(carBrandName !== null && carModel !== null && carYearOfMake !== null &&
             carVariant !== null && carKmDriven !== null && carColor !== null &&
             numberOfOwners !== null && carCity !== null && shortDescription !== null &&
             maximumSellingPrice !== null && numberofDays !== null && emailAddress !== null)
           {

              var localEmailAddress = emailAddress.substring(emailAddress.indexOf("|") + 1);
              let now = new Date();
            	let auctionCreateDate = date.format(now,'YYYY-MM-DD');
            	let tempAuctionExpiryDate = date.addDays(now,parseInt(numberofDays));
            	let auctionExpiryDate = date.format(tempAuctionExpiryDate,'YYYY-MM-DD');

              var message = {
                            contentType: 'PlainText',
                            content: `:heavy_check_mark: Great I have got all the details I need, do you want me to proceed further and put up your *Car for Auction* with following details:\n` +
                                     `1. Car Brand: *${carBrandName}* \n` +
                                     `2. Model: *${carModel}* \n` +
                                     `3. Variant: *${carVariant}* \n` +
                                     `4. Color: *${carColor}* \n` +
                                     `5. Year of Make: *${carYearOfMake}* \n` +
                                     `6. Kms Driven: *${carKmDriven} Kms* \n` +
                                     `7. Expected Price: *INR. ${maximumSellingPrice}* \n` +
                                     `8. No.of people who have owned your car: *${numberOfOwners}* \n` +
                                     `9. Short Description: *${shortDescription}* \n` +
                                     `10. Your City: *${carCity}* \n` +
                                     `11. Number of Days Your Car will be kept open for Auction: *${numberofDays} days* from today's date\n` +
                                     `12. Auction Creation Date: *${auctionCreateDate}* \n` +
                                     `13. Auction Expiry Date: *${auctionExpiryDate}* \n` +
                                     `12. Your Email Address: *${localEmailAddress}*`,
              };
              return Promise.resolve(lexResponses.confirmIntent(intentRequest.sessionAttributes,
                                                            intentRequest.currentIntent.name,
                                                            intentRequest.currentIntent.slots,
                                                            message,
                                                            null));
          }//end of Confirm Intent response
    }
    if(confirmationStatus === 'Denied')
    {
        var fulfilmentResponse = lexResponses.buildFulfilmentResult('Fulfilled', 'Ok, Your Car will not be put up Auction, I hope you had a great experience talking to me. I will be happy to assist you again in future. \n Have a Great Day!');
        intentRequest.sessionAttributes = {};
        return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes,
                                                        fulfilmentResponse.fullfilmentState,
                                                        fulfilmentResponse.message));
    }

    return Promise.resolve(lexResponses.delegate(sessionAttributes,
											                             intentRequest.currentIntent.slots));
  });
};
