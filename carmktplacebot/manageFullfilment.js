'use strict';
const lexResponses = require('./lexResponses');
const slackChannelFactory = require('./slackchannels');
const databaseManager = require('../databaseManager');
const shortid = require('shortid');

module.exports = function(intentRequest) {

  const carBrandName = intentRequest.currentIntent.slots.CarBrandName;
  const carModel = intentRequest.currentIntent.slots.CarModel;
  const carYearOfMake = intentRequest.currentIntent.slots.CarYearOfMake;
  const carVariant = intentRequest.currentIntent.slots.CarVariant;
  const carKmDriven = intentRequest.currentIntent.slots.CarKmDriven;
  const carColor = intentRequest.currentIntent.slots.CarColor;
  const numberOfOwners = intentRequest.currentIntent.slots.NumberOfOwners;
  const carCity = intentRequest.currentIntent.slots.CarCity;
  const shortDescription = intentRequest.currentIntent.slots.ShortDescription;
  const maximumSellingPrice = intentRequest.currentIntent.slots.MaximumSellingPrice;
  const confirmationStatus = intentRequest.currentIntent.confirmationStatus;
  const numberofDays = intentRequest.currentIntent.slots.NumberOfDays;
  const emailAddress = intentRequest.currentIntent.slots.EmailAddress;
  var userId = intentRequest.userId;
  var sessionAttributes = intentRequest.sessionAttributes;
  return createCarBid(userId,
                      carBrandName,
                      carModel,
                      carYearOfMake,
                      carVariant,
                      carKmDriven,
                      carColor,
                      numberOfOwners,
                      carCity,
                      shortDescription,
                      maximumSellingPrice,
                      numberofDays,
                      emailAddress,
                      sessionAttributes).then(fullfiledOrder => {
            sessionAttributes = {};
    return lexResponses.close(sessionAttributes,
                              fullfiledOrder.fullfilmentState,
                              fullfiledOrder.message);
  });
};
function createCarBid(userId,carBrandName,carModel,
                      carYearOfMake,carVariant,carKmDriven,carColor,
                      numberOfOwners,carCity,shortDescription,
                      maximumSellingPrice,
                      numberofDays,emailAddress,
                      sessionAttributes) {

  var uniqueReferenceNumber = sessionAttributes.uniqueReferenceNumber;
  return databaseManager.createCarBid(userId,carBrandName,carModel,
                                      carYearOfMake,carVariant,carKmDriven,
                                      carColor,numberOfOwners,carCity,
                                      shortDescription,uniqueReferenceNumber,
                                      maximumSellingPrice,numberofDays,emailAddress).then(dealerMarketPlaceResponse => {
      var channelName = uniqueReferenceNumber;
      createBidChannel(dealerMarketPlaceResponse,
                        channelName,
                        uniqueReferenceNumber,
                        carBrandName,
                        carModel,
                        carYearOfMake,
                        carVariant,
                        carKmDriven,
                        carColor,
                        numberOfOwners,
                        carCity,
                        shortDescription,
                        maximumSellingPrice,
                        numberofDays);
      var message = `Thanks, Your Car ${carBrandName} ${carModel} ${carYearOfMake} has been put up for bid :bell: . \r\n ` + 
                     `Please quote the reference number *${uniqueReferenceNumber}* :pushpin: to know Bids against your Car \r\n \r\n` +
                     `:thumbsup: Allow me help me your friends selling their Car (if require) by spreading the word about me. I am found at the link \r\n` +
                     `http://marketplaceapps.s3-website-us-east-1.amazonaws.com`;
      return lexResponses.buildFulfilmentResult('Fulfilled', message);
  });
}
function createBidChannel(dealerMarketPlaceResponse,channelName,uniqueReferenceNumber,
                            carBrandName,carModel,carYearOfMake,carVariant,
                            carKmDriven,carColor,numberOfOwners,carCity,
                            shortDescription,maximumSellingPrice,
                            numberofDays){

    /*
    * We may have multiple Dealer Market Places hence it will create channels on all the Dealer Market places
    * Multiple Dealer Market Places are only possible when multiple slack teams have installed Dealer MarketPlace app
    */
    /*dealerMarketPlaceResponse.Items.forEach(function(item) {
        slackChannelFactory(item.security_token,
                                channelName,
                                uniqueReferenceNumber,
                                carBrandName,
                                carModel,
                                carYearOfMake,
                                carVariant,
                                carKmDriven,
                                carColor,
                                numberOfOwners,
                                carCity,
                                shortDescription,
                                maximumSellingPrice,
                                numberofDays);
    });*/
    dealerMarketPlaceResponse.forEach(function(item) {
       console.log(`VIKAS BAJAJ SONIA BAJAJ ${item.security_token}`);
       slackChannelFactory(item.security_token,
                                channelName,
                                uniqueReferenceNumber,
                                carBrandName,
                                carModel,
                                carYearOfMake,
                                carVariant,
                                carKmDriven,
                                carColor,
                                numberOfOwners,
                                carCity,
                                shortDescription,
                                maximumSellingPrice,
                                numberofDays);
    });    
  }
