const url = require('url');
const querystring = require('querystring');
const request = require('request-promise');
const date = require('date-and-time');
const databaseManager = require('../databaseManager');

module.exports = function (securityToken,
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
                            numberofDays){
    let now = new Date();
    let auctionCreateDate = date.format(now,'YYYY-MM-DD');
    let tempAuctionExpiryDate = date.addDays(now,parseInt(numberofDays));
    let auctionExpiryDate = date.format(tempAuctionExpiryDate,'YYYY-MM-DD');
    var url = "https://slack.com/api/channels.create";
    var options = {
      method: 'POST',
      uri: url,
      form : {
        token : securityToken,
        name: channelName
      },
      json: true,
    };
    request(options).then((response) => {
        var channelId = response.channel.id;
        return databaseManager.createChannelDetailsRecord(channelId,auctionExpiryDate,uniqueReferenceNumber).then(() => {
              return databaseManager.checkImageUpload(uniqueReferenceNumber).then(imageImploadResponse => {
                      var filenames='';
                      imageImploadResponse.Items.forEach(function(item) {
                          filenames += item.filename + "\r\n";
                      });
                      var message = "This message is from *MarketPlace Bot* and since you are a registered used Cars Dealer, you are getting this msg \r\n" +
                            ":star2: There is new Car up for sale in Dealers Market Place, seems like a great deal so hurry up in submitting your bid to grab the opportunity.\r\n \r\n" +
                            "Here are the required details:\r\n" +
                            ">>> Car Brand : *" + carBrandName + "*" + "\r\n" +
                            "Car Model : *" + carModel + "*" + "\r\n" +
                            "Car Variant : *" + carVariant + "*" + "\r\n" +
                            "Car Color : *" + carColor + "*" + "\r\n" +
                            "Year of Make : *" + carYearOfMake + "*" + "\r\n" +
                            "Kms Driven : *" + carKmDriven + "*" + "\r\n" +
                            "Expected Price: *INR." + maximumSellingPrice + "*" + "\r\n" +
                            "No.of people who have owned your car : *" + numberOfOwners + "*" + "\r\n" +
                            "Short shortDescription about the Vehicle : *" + shortDescription + "*" + "\r\n" +
                            "Car available in City : *" + carCity + "*" + "\r\n" +
                            "Auction Creation Date : *" + auctionCreateDate + "*" + "\r\n" +
                            "Auction Expiry Date: *" + auctionExpiryDate + "*" + "\r\n \r\n" +
                            "Use the following reference number to bid for the vehicle *" + uniqueReferenceNumber + "*" + "\r\n" +
                            "To submit your bid type type the following command in the message box \r\n" +
                            "*/bidforcar <amount> <bid reference> e.g. /bidforcar 600000 " + uniqueReferenceNumber + "*" + "\r\n";
                            if(filenames !== '')
                            {
                              message += "\r\n You can view images of the Car at following links: \r\n" + filenames;
                            }
                            inviteDealers(securityToken,response.channel.id,message);
              });
          });
    }).catch(function(error){
        console.log('inside the catch block with error ' + error);
    });
};
function inviteDealers(securityToken,channelId,message) {
  var url = "https://slack.com/api/users.list";
  var options = {
    method: "POST",
    uri: url,
    form : {
      token : securityToken,
      presence: false
    },
    json: true,
  };
  request(options).then((response) => {
      var url = "https://slack.com/api/channels.invite";
      for (var i = 0; i < response.members.length; i++)
      {
          var member = response.members[i];
          var options = {
              method: "POST",
              uri: url,
              form : {
                  token : securityToken,
                  channel: channelId,
                  user: member.id
              },
              json: true,
          };
          request(options).then((response) => {
            console.log(`member added ${member.id} and the name of the member is ${member.profile.first_name}`);
          }).catch(function(error){
            console.log('inside the catch block with error inviteDealers ' + error);
          });
      }
      postMessage(securityToken,channelId,message);
  }).catch(function(error){
        console.log('inside the catch block with error Inside inviteDealers ' + error);
  });
}
function postMessage(securityToken,channelId,message) {
  var url = "https://slack.com/api/chat.postMessage";
  var options = {
    method: "POST",
    uri: url,
    form : {
      token : securityToken,
      channel: channelId,
      text: message
    },
    json: true,
  };
  request(options).then((response) => {
      console.log('message sent to channel ' + message);
  }).catch(function(error){
        console.log('inside the catch block with error Post Message ' + error);
   });
}
