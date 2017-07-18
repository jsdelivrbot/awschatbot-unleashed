'use strict';
const date = require('date-and-time');
const AWS = require('aws-sdk');
const promisify = require('es6-promisify');
const _ = require('lodash');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.createCarBid = function(userId,
										carBrandName,
										carModel,
										carYearOfMake,
										carVariant,
										carKmDriven,
										carColor,
										numberOfOwners,
										carCity,
										shortDescription,
										uniqueReferenceNumber,
										maximumSellingPrice,
					                    numberofDays,
					                    emailAddress) {

	const item = {};
	item.carBrandName = carBrandName;
	item.CarModel = carModel;
	item.carYearOfMake = carYearOfMake;
	item.carVariant = carVariant;
	item.carKmDriven = carKmDriven;
	item.carColor = carColor;
	item.numberOfOwners = numberOfOwners;
	item.carCity = carCity;
	item.shortDescription = shortDescription;
	item.userId = userId;
	item.bid_reference = uniqueReferenceNumber;
	item.maximum_selling_price  = maximumSellingPrice;
	item.is_active = 'Y';

	let now = new Date();
	let auctionCreateDate = date.format(now,'YYYY-MM-DD');
	let tempAuctionExpiryDate = date.addDays(now,numberofDays);
	let auctionExpiryDate = date.format(tempAuctionExpiryDate,'YYYY-MM-DD');
	
	console.log(`Auction Creation Date is ${auctionCreateDate}`);
	console.log(`Auction Expiry Date is ${auctionExpiryDate}`);
	item.auction_create_date = auctionCreateDate;
	item.auction_end_date = auctionExpiryDate;
	item.number_of_days = numberofDays;
	item.email_address = emailAddress.substring(emailAddress.indexOf("|") + 1);

	//item: it is a new bid record just created in saveItemToTable
	return saveItemToTable('car-bid-master', item).then((item)=>{
		var table = "dealer-market-place-tokens";
        var marketPlaceType = "CarDealers";
        var params = {
	        		TableName: table,
	        		KeyConditionExpression: "market_place_type = :a",
		    		ExpressionAttributeValues : {
		      			":a":marketPlaceType
		    		}
		    	}
            	const getAsync = promisify(dynamo.query, dynamo);
    			return getAsync(params).then(response => {
		    		if (_.isEmpty(response)) {
			    		console.log('Could not get the security token out of dealer-market place token table');
			    		return Promise.reject(new Error('Could not get the security token out of dealer-market place token table'));
		    		}
	    			console.log(response);
	    			return response;
  				});
	});
};
module.exports.findBids = function(bidRef) {
	const params = {
	    TableName: 'car-bid-details',
	    KeyConditionExpression: "bid_reference = :a",
	    ExpressionAttributeValues : {
	      ":a":bidRef
	    }
  	};
	const getAsync = promisify(dynamo.query, dynamo);
	return getAsync(params).then(response => {
	    if (_.isEmpty(response)) {
	      console.log(`Bid with bidId:${bidRef} not found`);
	      return Promise.reject(new Error(`Bid with bidId:${bidRef} not found`));
	    }
    	console.log(response);
    	return response;
  	});
};
module.exports.recordBidSubmission = function(bidReference,dealerName,dealerSlackId,bidAmount) {
	const item = {};
	item.bid_reference = bidReference;
	item.dealer_reference = dealerSlackId;
	item.dealer_name = dealerName;
	item.bid_amount = bidAmount;
	//item: it is a new bid record just created in saveItemToTable
	return saveItemToTable('car-bid-details', item).then((item)=>{
		return Promise.resolve(item);
	});
};
module.exports.checkImageUpload = function(uniqueReferenceNumber) {
	const params = {
	    TableName: 'bid-master-images',
	    KeyConditionExpression: "bid_ref = :a",
	    ExpressionAttributeValues : {
	      ":a":uniqueReferenceNumber
	    }
  	};
	const getAsync = promisify(dynamo.query, dynamo);
	return getAsync(params).then(response => {
	    if (_.isEmpty(response)) {
	      console.log(`================No images found in the database uniqueReferenceNumber ${uniqueReferenceNumber}`);
	      return Promise.reject(new Error(`No images found in the database uniqueReferenceNumber ${uniqueReferenceNumber}`));
	    }
    	console.log(`Found image record for refernce Number : ${response}`);
    	return response;
  	});
};
module.exports.validateUserIdAndBidRef = function(bidRef,userId)
{
	console.log(`INSIDE validateUserId And Bid Reference number ${bidRef} and user id ${userId}`);	
	const params = {
	    TableName: 'car-bid-master',
	    Key:{
        	'bid_reference': bidRef
        }
  	};
	const getAsync = promisify(dynamo.get, dynamo);
	return getAsync(params).then(response => {
		console.log(`After hitting dynamo.getItem response is ${JSON.stringify(response)}`);
	  /*if (_.isEmpty(response)) {
	      console.log(`Bid with bidId:${bidRef} not found`);
	      return Promise.resolve(`Could not find any bids which mataches *${bidRef}*`);
	    }
	    if(response.Item.userId !== userId)
	    {
	    	console.log(`Bid Reference ${bidRef} Does not belong to user ${userId}`);
	      	return Promise.reject(new Error(`Bid Reference ${bidRef} does not belong to you hence please provide valid reference number`));	
	    }*/
    	console.log(response);
    	return Promise.resolve(response);
  	});
};
module.exports.validateBidRefAndDealerRef = function(bidRef,dealerRef)
{
	console.log(`INSIDE validateBidRefAndDealerRef bid ref ${bidRef} and dealer ref ${dealerRef}`);	
	const params = {
	    TableName: 'car-bid-details',
	    KeyConditionExpression: "bid_reference = :a",
	    ExpressionAttributeValues : {
	      ":a":bidRef
	    }
  	};
	const getAsync = promisify(dynamo.query, dynamo);
	return getAsync(params).then(response => {
		console.log(response);
    	return Promise.resolve(response);
  	});
};

module.exports.checkValidityOfAuction = function(bidRef)
{
	console.log(`INSIDE checkValidityOfAuction And Bid Reference number ${bidRef}`);	
	const params = {
	    TableName: 'car-bid-master',
	    Key:{
        	'bid_reference': bidRef
        }
  	};
	const getAsync = promisify(dynamo.get, dynamo);
	return getAsync(params).then(response => {
		console.log(`After hitting dynamo.getItem response is ${JSON.stringify(response)}`);
	    if (_.isEmpty(response)) {
	      console.log(`Bid with bidId:${bidRef} not found`);
	      return Promise.reject(new Error(`Bid with bidId:${bidRef} not found`));
	    }
    	console.log(response);
    	return response;
  	});
};


function saveItemToTable(tableName, item) {
	const params = {
    	TableName: tableName,
    	Item: item
  	};
	const putAsync = promisify(dynamo.put, dynamo);
	return putAsync(params).then(() => {
    	console.log(`Saving item ${JSON.stringify(item)}`);
      	return item;
    }).catch(error => {
      Promise.reject(error);
    });
}
