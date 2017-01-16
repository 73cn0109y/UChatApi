/**
 * Created by texpe on 12/01/2017.
 */

const router = require('express').Router();
const User = require('../../models/user');
const UserService = require('../../models/user-service');
const rp = require('request-promise');
const env = require('../../env');
let Services = {};

// Will dynamically load all providers in the providers subdirectory
(() => {
	require('fs').readdirSync(__dirname + '/providers').forEach(file => {
		if(file === 'utilties.js') return;

		let module = require(__dirname + '/providers/' + file);
		if(module.hasOwnProperty('getName'))
			Services[module.getName()] = module;
	});
})();

// Connect a service
router.get('/connect/:service', (req, res, next) => {
	const Service = env.services[req.params.service.toLowerCase()];
	if(!Service) return res.json({ success: false }).end();

	let ServiceObj = GetServiceObject(req.params.service, Service);
	if(!ServiceObj) return res.json({ success: false }).end();

	const loginData = ServiceObj.buildLoginUri();

	res.redirect(loginData.URL);
});

router.get('/disconnect/:service', (req, res, next) => {
	let serviceName = req.params.service;
	serviceName = serviceName[0].toUpperCase() + serviceName.substr(1, serviceName.length - 1).toLowerCase();

	User.findOne({ Email: req.session.user.Email }, (err, result) => {
		let user = result.toObject();
		delete user._id;
		if(user.Services[serviceName]) {
			user.Services[serviceName].AccessToken = '';
			user.Services[serviceName].Connected = false;
		}

		User.update({ Email: req.session.user.Email }, user, (err, result) => {
			if(err) return res.json({ success: false }).end();
			res.send("<h1>Disconnected</h1><p>This window will close automatically...</p><script>opener.popupActionComplete(function(){window.close();});</script>");
		});
	});
});

// callback for service connecting
// also get's the token(s) from the code
router.get('/authorize/:service', (req, res, next) => {
	const Service = env.services[req.params.service.toLowerCase()];
	if(!Service) return res.json({ success: false }).end();

	let ServiceObj = GetServiceObject(req.params.service, Service);
	if(!ServiceObj) return res.json({ success: false }).end();

	// Checks if the query has all required parameters
	// ready to perform a successful token exchange
	const requiredQueryParams = ['code', 'state'];
	for(let i = 0; i < requiredQueryParams.length; i++) {
		if(!req.query.hasOwnProperty(requiredQueryParams[i]))
			return res.json({ success: false }).end();
	}

	const authUri = ServiceObj.buildAuthUri(req.query);

	rp({
		method: 'POST',
		uri: authUri.URL,
		form: authUri.Body,
		headers: authUri.Headers,
		json: true
	}).then(response => {
		const AccessToken = response.access_token;
		const RefreshToken = response.refresh_token;
		const Scopes = response.scope;

		// User extra information about the user and their channel
		Services[ServiceObj.Name].getUserInfo(AccessToken).then(response => {
			let serviceName = ServiceObj.Name;
			let saveTokenData = new Promise((resolve, reject) => {
				User.findOne({ _id: req.session.user._id }, (err, result) => {
					if(err || !result) return reject(err);

					let user = result.toObject();

					delete user._id;

					// If service data doesn't exist in the database
					// Create the model for it
					if(!user.Services[serviceName]) user.Services[serviceName] = new UserService.Model();

					user.Services[serviceName].UserServiceInfo = response;

					if(AccessToken) user.Services[serviceName].AccessToken = AccessToken;
					if(RefreshToken) user.Services[serviceName].RefreshToken = RefreshToken;
					// Twitch.tv returns the scopes in an array already
					if(Scopes)
						user.Services[serviceName].Scopes = (Array.isArray(Scopes) ? Scopes : (typeof Scopes === 'string' ? Scopes.split(' ') : []));

					user.Services[serviceName].Connected = true;

					User.update({ _id: result._id }, user, { multi: false }, (err, result) => {
						if(err) return reject(err);
						resolve(result);
					});
				});
			});

			saveTokenData.then(response => {
				res.send("<h1>Connected</h1><p>This window will close automatically...</p><script>opener.popupActionComplete(function(){window.close();});</script>");
			}).catch((error) => {
				console.log(error);
				res.json({ success: false, result: "Could not connect " + req.params.service }).end();
			});
		}).catch(err => {
			console.error(err);
		});
	}).catch(err => {
		console.error(err);

		res.json({ success: false, error_a: err }).end();
	});
});

const GetServiceObject = (service, Service) => {
	service = service[0].toUpperCase() + service.substr(1, service.length - 1).toLowerCase();
	return (Services[service] ? new Services[service](Service) : null);
};

module.exports = router;