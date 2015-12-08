module.exports = function(app) {
	var router = app.loopback.Router();
	var actModel = app.models.Account;

	//REST endpoint exposed to Salesforce
	router.post('/processSFMsg', function(req, res) {
		var account = parseMessage(req.body);

		// by default return a 'false' Ack to Salesforce
		var resMsg = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:out="http://soap.sforce.com/2005/09/outbound"><soapenv:Header/><soapenv:Body><out:notificationsResponse><out:Ack>false</out:Ack></out:notificationsResponse></soapenv:Body></soapenv:Envelope>';

		if (account) {
			actModel.upsert(account, function(err, acc) {
				if(!err){
					// return a 'true' Ack if data insert/updated successfully in MongoDB
		  			resMsg = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:out="http://soap.sforce.com/2005/09/outbound"><soapenv:Header/><soapenv:Body><out:notificationsResponse><out:Ack>true</out:Ack></out:notificationsResponse></soapenv:Body></soapenv:Envelope>';
				}
				res.send(resMsg);
			});
		}
		else
		{
			res.send(resMsg);
		}
		
	}); 

	// parse the xml and return json object
	parseMessage = function(obj) {
	  try {

	  	// extract attributes from XML
	    var accountId = obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:id'] ? obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:id'][0] : '';
	    var accountNumber = obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:accountnumber'] ? obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:accountnumber'][0] : '';
	    var accountIndustry = obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:industry'] ? obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:industry'][0] : '';
	    var accountName = obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:name'] ? obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:name'][0] : '';
	    var accountPhone = obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:phone'] ? obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:phone'][0] : '';
	    var accountType = obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:type'] ? obj['soapenv:envelope']['soapenv:body'][0].notifications[0].notification[0].sobject[0]['sf:type'][0] : '';

	    return {
		    account_id:accountId,
			num:accountNumber,
			name:accountName,
			type:accountType,
			industry:accountIndustry,
			phone:accountPhone
	    };

	  } catch (e) {
	    console.log('Exception parsing Salesforce XML', e);
	    return null;
	  }
	};

  	app.use(router);
}