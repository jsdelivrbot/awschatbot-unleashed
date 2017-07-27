'use strict';
const handleFulfillmentCodeHook = require('./manageFullfilment');
const handleDialogCodeHook = require('./manageDialogs');
module.exports = function (intentRequest) {
	const source = intentRequest.invocationSource;    
	if (source === 'DialogCodeHook') {
        return handleDialogCodeHook(intentRequest);
    }
    if (source === 'FulfillmentCodeHook') {
        return handleFulfillmentCodeHook(intentRequest);
    }
};
          
