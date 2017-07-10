'use strict';

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
										uniqueReferenceNumber) {
	console.log('createCarBid');
	const item = {};
	item.carId = uniqueReferenceNumber;
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