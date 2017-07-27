'use strict';

const dispatch = require('./carmktplacebot/dispatch');
const authorizer = require('./dealersmktplace/authorization');
const submitBid = require('./dealersmktplace/bidForCar');
const bidInactive = require('./markbidinactive/markInactive');
const uploadedImages = require('./uploadimagetrigger/imageUploaded');

module.exports.intents = (event, context, callback) => {
	try {
	    console.log(`event.bot.name=${event.bot.name}`);
	    dispatch(event).then(response => {
	    	callback(null, response);
	    });
	} catch (err) {
	    callback(err);
	}
};
module.exports.authorization = (event, context, callback) => {
	try{
		const code = event.queryStringParameters.code;
  		authorizer(code).then(() =>{
    		const response = {
	        	statusCode: 200,
	        	body: JSON.stringify(
	          	{
		            message: 'Authorisation was called',
	       	    	input: event,
	          	}),
      		};
    		callback(null, response);
		});
	} catch(err) {
		callback(err);
	}
};
module.exports.bidForCar = (event, context, callback) => {
	try {
		submitBid(event).then((response) => {
			callback(null, response);
		});
	} catch(err) {
		callback(err);
	}
};
module.exports.markBidInvalid = (event, context, callback) => {
	try {
		console.log("Called as part of Cron Job That runs Everyday");
		var response = bidInactive(event);
		callback(null, response);
	} catch(err) {
		callback(err);
	}
};

module.exports.s3UploadTriggered = (event, context, callback) => {
try {
		console.log("Called as part of AutoImage Upload to S3 Bucket");
		var response = uploadedImages(event);
		callback(null, response);
	} catch(err) {
		callback(err);
	}
};
