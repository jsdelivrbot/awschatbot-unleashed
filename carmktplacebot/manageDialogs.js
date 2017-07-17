'use strict';
const date = require('date-and-time');
const lexResponses = require('./lexResponses');
const validator = require('./validation');
const databaseManager = require('../databaseManager');
const _ = require('lodash');

module.exports = function(intentRequest) {

    const slots = intentRequest.currentIntent.slots;
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

    console.log(`The CONFIRMATION STATUS IS ${confirmationStatus}`);
    console.log(`The inputTranscript IS ${inputTranscript}`);
    console.log(` carBrandName ${carBrandName}`);
    console.log(` carModel ${carModel}`);
    console.log(` carYearOfMake ${carYearOfMake}`);
    console.log(` carVariant ${carVariant}`);
    console.log(` carKmDriven ${carKmDriven}`);
    console.log(` carColor ${carColor}`);
    console.log(` numberOfOwners ${numberOfOwners}`);
    console.log(` carCity ${carCity}`);
    console.log(` shortDescription ${shortDescription}`);
    console.log(` number of days ${numberofDays}`);
    const validationResult = validator.validateCarDetails(carBrandName,
                                                          carModel,
                                                          carYearOfMake,
                                                          carVariant,
                                                          carKmDriven,
                                                          carColor,
                                                          numberOfOwners,
                                                          carCity,
                                                          shortDescription,
                                                          numberofDays,
                                                          emailAddress);

    console.log(`validationResult.isValid value is ${validationResult.isValid} and violatedSlot is ${validationResult.violatedSlot}`);
    if (!validationResult.isValid)
    {
      /*
      * this block below is checking if session attribute is non empty and contains violated slot which is
      * same as the slot which has again violated in validation then close the conversation as user
      * does not have a valid input for the slot.
      */
      console.log(`Session Attributes is : ${sessionAttributes}`);
      var isSessionAttributeEmpty = _.isEmpty(sessionAttributes);
      console.log(`Session Attribute Empty check is ${isSessionAttributeEmpty}`);
      if(!isSessionAttributeEmpty)
      {
           console.log(`sessionAttributes Violated Slot is ${sessionAttributes.violatedSlot}`) ;
           if(sessionAttributes.violatedSlot === validationResult.violatedSlot)
           {
              var fulfilmentResponse = lexResponses.buildFulfilmentResult('Fulfilled', 'I wish I could help you but unfortunately with provided details, I will not be able to proceed any further. \n Thank you for your visit and Have a Great Day!');
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
      sessionAttributes = {};
      sessionAttributes.violatedSlot = validationResult.violatedSlot;
      var response = lexResponses.elicitSlot(sessionAttributes,
                                              intentRequest.currentIntent.name,
                                              slots,
                                              validationResult.violatedSlot,
                                              validationResult.message,
                                              responseCard);
      var strResponse = JSON.stringify(response);
      console.log(strResponse);
      return Promise.resolve(response);
    }//end of  if (!validationResult.isValid)
    //*************************End of Validation*********************************

    console.log(`checking for Confirmation Status check ${confirmationStatus}`);
    if(confirmationStatus !== 'Confirmed' && confirmationStatus !== 'Denied')
    {
          console.log('right outside the car km driven elicit slot construct');
          if(carBrandName !== null && carModel !== null && carYearOfMake !== null &&
              carVariant !== null && carKmDriven === null)
          {
              sessionAttributes = {};
              console.log('inside Car Km Driven Elicit Slot construct');
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
              console.log(strResponse);
              return Promise.resolve(response);
          }//end of ElicitSlot response for Car Km Driven
          if(carBrandName !== null && carModel !== null && carYearOfMake !== null &&
             carVariant !== null && carKmDriven !== null && carColor !== null && numberOfOwners === null)
          {
              sessionAttributes = {};
              console.log('inside Number Of Owners Elicit Slot construct');
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
              console.log(strResponse);
              return Promise.resolve(response);
          }//end of ElicitSlot response for Number of Owners
          if(carBrandName !== null && carModel !== null && carYearOfMake !== null &&
             carVariant !== null && carKmDriven !== null && carColor !== null &&
             numberOfOwners !== null && carCity !== null && shortDescription !== null &&
             maximumSellingPrice !== null && numberofDays === null)
          {
              sessionAttributes = {};
              console.log('inside Auction Expire Elicit Slot construct');
              var options = lexResponses.buildOptions('NumberOfDays');
              responseCard = lexResponses.buildResponseCard('Specify Number of Days for Auction Expire',
                                                        'Choose one of the options below or Mention number in the message box below',
                                                        options);
              var message = { contentType: 'PlainText', content: 'We generally recommend to keep Auction open for *3 Days* however you may select any option below \n Choose one of the options below'};
              var response = lexResponses.elicitSlot(sessionAttributes,
                                                    intentRequest.currentIntent.name,
                                                    slots,
                                                    'NumberOfDays',
                                                    message,
                                                    responseCard);
              var strResponse = JSON.stringify(response);
              console.log(strResponse);
              return Promise.resolve(response);
          }//end of ElicitSlot response for Number of Owners*/

          if(carBrandName !== null && carModel !== null && carYearOfMake !== null &&
             carVariant !== null && carKmDriven !== null && carColor !== null &&
             numberOfOwners !== null && carCity !== null && shortDescription !== null &&
             maximumSellingPrice !== null && numberofDays !== null && emailAddress !== null)
           {
              var emailAddress1 = emailAddress.substring(emailAddress.indexOf("|") + 1);
              let now = new Date();
            	let auctionCreateDate = date.format(now,'DD-MMM-YYY');
            	let tempAuctionExpiryDate = date.addDays(now,numberofDays);
            	let auctionExpiryDate = date.format(tempAuctionExpiryDate,'DD-MMM-YYY');
              var message = {
                            contentType: 'PlainText',
                            content: `Great I have got all the details I need, do you want me to proceed further and put up your *Car for Auction* with following details:\n` +
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
                                     `11. Number of Days Your Car will be kept open for Auction: *${numberofDays} days* \n` +
                                     `12. Auction Creation Date: *${auctionCreateDate}* \n` +
                                     `13. Auction Expiry Date: *${auctionExpiryDate}* \n` +
                                     `12. Your Email Address: *${emailAddress1}*`,
              };
              return Promise.resolve(lexResponses.confirmIntent(intentRequest.sessionAttributes,
                                                            intentRequest.currentIntent.name,
                                                            intentRequest.currentIntent.slots,
                                                            message,
                                                            null));
          }//end of Confirm Intent response
    }
    console.log(`checking for Denied value of confirmation status ${confirmationStatus}`);
    if(confirmationStatus === 'Denied')
    {
        console.log('Inside Denied check and creating close response');
        var fulfilmentResponse = lexResponses.buildFulfilmentResult('Fulfilled', 'Ok, Your Car will not be put up Auction, I hope you had a great experience talking to me. I will be happy to assist you again in future. \n Have a Great Day!');
        intentRequest.sessionAttributes = {};
        return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes,
                                                        fulfilmentResponse.fullfilmentState,
                                                        fulfilmentResponse.message));
    }
    console.log('before Creting Delegate Response');
    return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes,
											                             intentRequest.currentIntent.slots));
};
