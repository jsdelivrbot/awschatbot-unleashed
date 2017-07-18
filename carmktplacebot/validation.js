'use strict';
const _ = require('lodash');
const isNumeric = require('isnumeric');
var validator = require('validator');
const promisify = require('es6-promisify');
const databaseManager = require('../databaseManager');
module.exports.validateCarDetails = function (carBrandName,
                                               carModel,
                                                carYearOfMake,
                                                carVariant,
                                                carKmDriven,
                                                carColor,
                                                numberOfOwners,
                                                carCity,
                                                shortDescription,
                                                numberofDays,
                                                emailAddress,
                                                imageUpload,
                                                uniqueReferenceNumber) {
     const carBrandNames = ['nissan', 'ford', 'jaguar', 'fiat', 'general motors', 'mahindra', 'bentley','bmw','mitsubishi','mazda','bugatti','buick','jeep','renault','datsun','acura','aston martin','maruti suzuki','tata','hyundai','isuzu','suzuki','honda','alfa romeo','audi','mercedes-benz','toyota'];
     const carKmDrivenValues = ['less than 12000','12001 - 18000','18001 - 24000','24001 - 32000','32001 - 40000']; 
     if(carBrandName)
     {
        var isCarBrandCarValid = carBrandNames.includes(carBrandName.toLowerCase());
        if(!isCarBrandCarValid)
        {
              var concatString = '\n';
              var counter = 1;
              _.forEach(carBrandNames, function(value) {
                  console.log(value);
                  var tempCarBrand = counter + '.  ' + _.startCase(_.toLower(value));
                  concatString += tempCarBrand;
                  concatString += '\n';
                  counter++;
              });
              carBrandName = _.startCase(_.toLower(carBrandName));
              return buildValidationResult(false,
                                           'CarBrandName',
                                           `Kindly note *${carBrandName}* is not in our list. pls check if your *Car Brand* exist in the list below as we only deal in the following *Car Brands* ${concatString}`,
                                           null,
                                           null,
                                           false);
        }
     }
     if(carYearOfMake)
     {
         var text = /^[0-9]+$/;
         if (((carYearOfMake != "") && (!text.test(carYearOfMake))) || (carYearOfMake.length != 4))
         {
          return buildValidationResult(false,
                                      'CarYearOfMake',
                                      `Please check ${carYearOfMake} is not a valid year, Valid year must be like YYYY format e.g. 2012`,
                                      null,
                                      null,
                                      false);
        }
        var current_year = new Date().getFullYear();
        if(carYearOfMake > current_year)
        {
          return buildValidationResult(false, 
                                        'CarYearOfMake',
                                        `Please check seems you have mistakenly entered a future year ${carYearOfMake}, kindly provide the correct Year of Make`,
                                        null,
                                        null,
                                        false);
        }
        if(carYearOfMake < 2000)
        {
            return buildValidationResult(false, 
                                        'CarYearOfMake',
                                        `Dealer Market Place does not response well for Cars which has Year of Make earlier than 2000, pls check if the year entered was correct and then reenter`,
                                        null,
                                        null,
                                        false);
        }
     }
      if(carKmDriven)
      {
         var isCarKmDrivenValid = carKmDrivenValues.includes(carKmDriven.toLowerCase());
         if(!isCarKmDrivenValid)
         {
            var isNumericFlag = isNumeric(carKmDriven);
            if(isNumericFlag)
            {
                if(carKmDriven <= 0)
                {
                  return buildValidationResult(false, 
                                        'CarKmDriven',
                                        `I cannot take ${carKmDriven} as Car Kms Driven figure.\n Specify Car Kms Driven either by choosing one of the options below or mention exact Kms figure`,
                                        'Specify Car Km Driven',
                                        'Choose one of the options or mention exact figure',
                                        true);
                }
            }
            else
            {
              return buildValidationResult(false, 
                                        'CarKmDriven',
                                        `I cannot take ${carKmDriven} as Car Kms Driven figure.\n Specify Car Kms Driven either by choosing one of the options below or mention exact Kms figure`,
                                        'Specify Car Km Driven',
                                        'Choose one of the options or mention exact figure',
                                        true);
            }
         }
      }
      if(numberOfOwners)
      {
         var isNumericFlag = isNumeric(numberOfOwners); 
         if(!isNumericFlag)
         {
              return buildValidationResult(false, 
                                          'NumberOfOwners',
                                          `Number of Owners has to be one of the values mentioned below or specify a number in the message box below`,
                                          'Specify Car Number of Owners',
                                          'Choose one of the options or mention number in the message box below',
                                          true);      
         }
         else
         {
            var isNumberOfOwnersValid = numberOfOwners > 0  && numberOfOwners <= 5; 
            if(!isNumberOfOwnersValid)
            {
                return buildValidationResult(false, 
                                          'NumberOfOwners',
                                          `Number of Owners has to be one of the values mentioned below or specify a number in the message box below`,
                                          'Specify Car Number of Owners',
                                          'Choose one of the options or mention number in the message box below',
                                          true);          
            }
         }
      }
      if(numberofDays)
      {
          var isAuctionExpireFlag = isNumeric(numberofDays); 
          if(!isAuctionExpireFlag)
          {
             return buildValidationResult(false, 
                                          'NumberOfDays',
                                          'Days for Auction Expire has to be one of the values mentioned below',
                                          'Specify Days for Auction Expire',
                                          'Choose one of the options below',
                                          true);      
          }
          if(numberofDays < 3  || numberofDays > 5)
          {
                return buildValidationResult(false, 
                                          'NumberOfDays',
                                          'Days for Auction Expire has to be one of the values mentioned below',
                                          'Specify Days for Auction Expire',
                                          'Choose one of the options below',
                                          true);      
          }         
      }
      if(emailAddress)
      {
          var localEmailAddress = emailAddress.substring(emailAddress.indexOf("|") + 1);
          var isValidEmailId = validator.isEmail(localEmailAddress); 
          if(!isValidEmailId)
          {
              return buildValidationResult(false, 
                                          'EmailAddress',
                                          'Please check your Email Address again',
                                          null,
                                          null,
                                          false);      
          }
      }
      if(imageUpload)
      {
          console.log(`inside validation check for Image Upload ${imageUpload}`);
          if(imageUpload !== 'N' && imageUpload !== 'Y')
          {
              return buildValidationResult(false, 
                                          'ImageUpload',
                                          '*Post Upload* images click on *Have Uploaded* or *Have No Images* if you don not want',
                                          'Specify your input by selecting an option below',
                                          'Choose one of the options below',
                                          true);      
          }
          if(imageUpload === 'Y')
          {
              //Rajat bhai ker de

                return databaseManager.checkImageUpload(uniqueReferenceNumber).then(imageImploadResponse => {

                if(imageImploadResponse.Count === 0){

                  return buildValidationResult(false, 
                                          'ImageUpload',
                                          '*Post Upload* images click on *Have Uploaded* or *Have No Images* if you don not want',
                                          'Specify your input by selecting an option below',
                                          'Choose one of the options below',
                                          true);   

                }
                else {  
                        return buildValidationResult(true, 
                                                    null,
                                                    null,
                                                    null,
                                                    null,
                                                    null);   
                    }
            });
        }
      }
      return buildValidationResult(true, null, null,null,null,null);
}
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
