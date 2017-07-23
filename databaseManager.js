'use strict';
const date = require('date-and-time');
const AWS = require('aws-sdk');
const promisify = require('es6-promisify');
const _ = require('lodash');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.createCarBid = function(userId,carBrandName,carModel,carYearOfMake,carVariant,
										carKmDriven,carColor,numberOfOwners,carCity,shortDescription,
										uniqueReferenceNumber,maximumSellingPrice,numberofDays,emailAddress) {

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
				let tempAuctionExpiryDate = date.addDays(now,parseInt(numberofDays) + 1);
				let auctionExpiryDate = date.format(tempAuctionExpiryDate,'YYYY-MM-DD');

				console.log(`Auction Creation Date is ${auctionCreateDate}`);
				console.log(`Auction Expiry Date is ${auctionExpiryDate}`);
				item.auction_create_date = auctionCreateDate;
				item.auction_end_date = auctionExpiryDate;
				item.number_of_days = numberofDays;
				item.email_address = emailAddress.substring(emailAddress.indexOf("|") + 1);

				//item: it is a new bid record just created in saveItemToTable
				return saveItemToTable('car-bid-master', item).then((item)=>{
					return f_getCarMarketPlaceSecurityTokens();
					/*var table = "dealer-market-place-tokens";
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
			  				});*/
				});
};
function f_getCarMarketPlaceSecurityTokens() {
	var table = "dealer-market-place-tokens1";
	var chkMarket = "CarDealers";
 	var paramsQuery = {
	    TableName : table,
	    KeyConditionExpression: "#market = :markettype",
	    ExpressionAttributeNames:{
	        "#market": "market_place_type"
	    },
	    ExpressionAttributeValues: {
	        ":markettype":'CarDealers'
	    }
	};
	const getAsync = promisify(dynamo.query, dynamo);
	return getAsync(paramsQuery).then(response => {
		var mytokens;
        response.Items.forEach(function(item) {
            console.log(" -", JSON.stringify(item.tokens) + "\r\n"); // 0 get first tokrn replace 0 and you will get all the tokens
            mytokens = item.tokens;
            return false;      
        });
        console.log(`Return all the tokens from the database ${JSON.stringify(mytokens)}`);
        return Promise.resolve(mytokens);
        /*var tonkens
        mytokens.forEach(function(ding) {
            console.log(`${ding.security_token}`);
        });*/
    });
}
module.exports.getCarMarketPlaceSecurityTokens = function(){
	return f_getCarMarketPlaceSecurityTokens();
};
module.exports.getSlackTeamSecurityToken = function(){
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
}
/*
* this methods returns the bid detail record from car-bid-detail for
* a bid reference number and a dealer name. Since dealer name is a
* non-key attribute in the table, this method uses local secondary index
* to fetch the record. Return type is only one item as bid reference and dealer_name
* combination is unique
*/
module.exports.getCarBidDetail = function(bidRef,dealer_name){
	var table = 'car-bid-details';
	var indexName = 'bid_reference-dealer_name-index';
	var params = { 
		TableName: table,
		IndexName: indexName,
		KeyConditionExpression: 'bid_reference = :x and dealer_name = :y',
		ExpressionAttributeValues: { 
			':x': bidRef,
			':y': dealer_name
		}
	};
	const getAsync = promisify(dynamo.query, dynamo);
	return getAsync(params).then(response => {
		console.log(`In GetCarBidDetail the response is ${JSON.stringify(response)}`);
		if (_.isEmpty(response)) {
			console.log(`record with bid reference ${bidRef} and dealer_name ${dealer_name} does not exist`);
			return Promise.reject(new Error(`record with bid reference ${bidRef} and dealer_name ${dealer_name} does not exist`));
		}
		console.log(`Found Car bid details record ${JSON.stringify(response)}`);
		return response;
	});
};
/*
* this methods returns the bid master record from car-bid-master for
* a bid reference number. Return type is only one item as bid reference
* unique in the table
*/
module.exports.getCarBidMaster = function(bidRef){
	const params = {
	    TableName: 'car-bid-master',
	    Key:{
        	'bid_reference': bidRef
        }
  	};
	const getAsync = promisify(dynamo.get, dynamo);
	return getAsync(params).then(response => {
		if (_.isEmpty(response)) {
			return Promise.reject(new Error(`record with bid reference ${bidRef} does not exist in Bid Master`));
		}
		return Promise.resolve(response);
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
	    	console.log(`Found image record for refernce Number : ${JSON.stringify(response)}`);
	    	return response;
	  	});
};
module.exports.validateUserIdAndBidRef = function(bidRef,userId)
{
	const params = {
	    TableName: 'car-bid-master',
	    Key:{
        	'bid_reference': bidRef
        }
  	};
	const getAsync = promisify(dynamo.get, dynamo);
	return getAsync(params).then(response => {
		return Promise.resolve(response);
	});
};
module.exports.validateBidRefAndDealerRef = function(bidRef,dealerRef)
{
		const params = {
		    TableName: 'car-bid-details',
		    KeyConditionExpression: "bid_reference = :a",
		    ExpressionAttributeValues : {
		      ":a":bidRef
		    }
	    };
		const getAsync = promisify(dynamo.query, dynamo);
		return getAsync(params).then(response => {
	    	return Promise.resolve(response);
	  });
};
module.exports.checkValidityOfAuction = function(bidRef)
{
		const params = {
		    TableName: 'car-bid-master',
		    Key:{
	        	'bid_reference': bidRef
	        }
	  };
		const getAsync = promisify(dynamo.get, dynamo);
		return getAsync(params).then(response => {
		  if (_.isEmpty(response)) {
	    	  return Promise.reject(new Error(`Bid with bidId:${bidRef} not found`));
	    }
    	return response;
  	});
};
module.exports.checkValidBidReference = function(bidRef)
{

	const params = {
			TableName: 'car-bid-master',
			Key:{
					'bid_reference': bidRef
				}
		};
	const getAsync = promisify(dynamo.get, dynamo);
	return getAsync(params).then(response => {
			if (_.isEmpty(response)) {
					return Promise.resolve("N");
			}
			return Promise.resolve("Y");
		});
};
module.exports.createChannelDetailsRecord = function(channelId,channelArchiveDate,uniqueReferenceNumber)
{
		const item = {};
		item.channel_id = channelId;
		item.channel_expiry_date = channelArchiveDate;
		item.bid_reference = uniqueReferenceNumber;
		//item: it is a new bid record just created in saveItemToTable
		return saveItemToTable('channel-details', item).then((item)=>{
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
