'use strict';

/**
 * Created by texpe on 12/01/2017.
 */

var router = require('express').Router();
var User = require('../../models/user');
var UserService = require('../../models/user-service');
var rp = require('request-promise');
var env = require('../../env');
var Services = {};

// Will dynamically load all providers in the providers subdirectory
(function () {
	require('fs').readdirSync(__dirname + '/providers').forEach(function (file) {
		if (file === 'utilties.js') return;

		var module = require(__dirname + '/providers/' + file);
		if (module.hasOwnProperty('getName')) Services[module.getName()] = module;
	});
})();

// Connect a service
router.get('/connect/:service', function (req, res, next) {
	var Service = env.services[req.params.service.toLowerCase()];
	if (!Service) return res.json({ success: false }).end();

	var ServiceObj = GetServiceObject(req.params.service, Service);
	if (!ServiceObj) return res.json({ success: false }).end();

	var loginData = ServiceObj.buildLoginUri();

	res.redirect(loginData.URL);
});

router.get('/disconnect/:service', function (req, res, next) {
	var serviceName = req.params.service;
	serviceName = serviceName[0].toUpperCase() + serviceName.substr(1, serviceName.length - 1).toLowerCase();

	User.findOne({ Email: req.session.user.Email }, function (err, result) {
		var user = result.toObject();
		delete user._id;
		if (user.Services[serviceName]) {
			user.Services[serviceName].AccessToken = '';
			user.Services[serviceName].Connected = false;
		}

		User.update({ Email: req.session.user.Email }, user, function (err, result) {
			if (err) return res.json({ success: false }).end();
			res.send("<h1>Disconnected</h1><p>This window will close automatically...</p><script>opener.popupActionComplete(function(){window.close();});</script>");
		});
	});
});

// callback for service connecting
// also get's the token(s) from the code
router.get('/authorize/:service', function (req, res, next) {
	var Service = env.services[req.params.service.toLowerCase()];
	if (!Service) return res.json({ success: false }).end();

	var ServiceObj = GetServiceObject(req.params.service, Service);
	if (!ServiceObj) return res.json({ success: false }).end();

	// Checks if the query has all required parameters
	// ready to perform a successful token exchange
	var requiredQueryParams = ['code', 'state'];
	for (var i = 0; i < requiredQueryParams.length; i++) {
		if (!req.query.hasOwnProperty(requiredQueryParams[i])) return res.json({ success: false }).end();
	}

	var authUri = ServiceObj.buildAuthUri(req.query);

	rp({
		method: 'POST',
		uri: authUri.URL,
		form: authUri.Body,
		headers: authUri.Headers,
		json: true
	}).then(function (response) {
		var AccessToken = response.access_token;
		var RefreshToken = response.refresh_token;
		var Scopes = response.scope;

		// User extra information about the user and their channel
		Services[ServiceObj.Name].getUserInfo(AccessToken).then(function (response) {
			var serviceName = ServiceObj.Name;
			var saveTokenData = new Promise(function (resolve, reject) {
				User.findOne({ _id: req.session.user._id }, function (err, result) {
					if (err || !result) return reject(err);

					var user = result.toObject();

					delete user._id;

					// If service data doesn't exist in the database
					// Create the model for it
					if (!user.Services[serviceName]) user.Services[serviceName] = new UserService.Model();

					user.Services[serviceName].UserServiceInfo = response;

					if (AccessToken) user.Services[serviceName].AccessToken = AccessToken;
					if (RefreshToken) user.Services[serviceName].RefreshToken = RefreshToken;
					// Twitch.tv returns the scopes in an array already
					if (Scopes) user.Services[serviceName].Scopes = Array.isArray(Scopes) ? Scopes : typeof Scopes === 'string' ? Scopes.split(' ') : [];

					user.Services[serviceName].Connected = true;

					User.update({ _id: result._id }, user, { multi: false }, function (err, result) {
						if (err) return reject(err);
						resolve(result);
					});
				});
			});

			saveTokenData.then(function (response) {
				res.send("<h1>Connected</h1><p>This window will close automatically...</p><script>opener.popupActionComplete(function(){window.close();});</script>");
			}).catch(function (error) {
				console.log(error);
				res.json({ success: false, result: "Could not connect " + req.params.service }).end();
			});
		}).catch(function (err) {
			console.error(err);
		});
	}).catch(function (err) {
		console.error(err);

		res.json({ success: false, error_a: err }).end();
	});
});

var GetServiceObject = function GetServiceObject(service, Service) {
	service = service[0].toUpperCase() + service.substr(1, service.length - 1).toLowerCase();
	return Services[service] ? new Services[service](Service) : null;
};

module.exports = router;