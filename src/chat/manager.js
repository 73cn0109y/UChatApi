/**
 * Created by texpe on 16/01/2017.
 */

const UserModel = require('../models/user');
let Platforms = {};

// Dynamically load all platforms
// Saves us from having to import them manually
(() => {
	require('fs').readdirSync(__dirname + '/platforms').forEach(file => {
		if(file === 'utilties.js') return;

		let module = require(__dirname + '/platforms/' + file);
		if(module.hasOwnProperty('getName'))
			Platforms[module.getName()] = module;
	});
})();

class BotManager {
	constructor(callbacks) {
		this.channels = [];
		this.users = new Map();
		this.services = new Map();
		this.ignoreUsers = [
			'revlobot',
			'nightbot',
			'73cn0b0t'
		];
		this.history = [];
		this.callbacks = callbacks;
	}

	onChatMessage(api_token, serviceName, channel, userInfo, message) {
		channel = channel.toLowerCase();

		//if(this.ignoreUsers.indexOf(userInfo.Username.toLowerCase()) >= 0) return;

		const user = this.getUserFromToken(api_token).then(user => {
			if(userInfo.Username.toLowerCase() === user.Services[serviceName].UserServiceInfo.UserName.toLowerCase()) {
				serviceName = 'broadcaster';
				userInfo = {
					Username: 'Broadcaster',
					isModerator: false,
					isSubscriber: false,
					isBroadcaster: true
				};
			}

			this.callbacks.onChatMessage(api_token, serviceName, channel, userInfo, message);
		}).catch(err => {
			this.callbacks.onChatMessage(api_token, serviceName, channel, userInfo, message);
		});
	}

	/**
	 * Will send a message to all authorized platforms
	 * @param channel
	 * @param message
	 */
	sendMessage(api_token, message, excludeService = null) {
		return new Promise((resolve, reject) => {
			if(!api_token || !message) return reject(false);

			const services = this.services.get(api_token);

			for(let service in services) {
				if(!services.hasOwnProperty(service) || !services[service].Connected) continue;
				if(excludeService === service) continue;
				services[service].sendMessage(message);
			}

			resolve(true);
		});
	}

	/**
	 * Will create a new set of platform bots and will
	 * login as the user on each platform they have authorized
	 * @param channel
	 */
	joinChannel(api_token, socket = null) {
		const self = this;

		return new Promise((resolve, reject) => {
			if(!api_token) return reject(false);

			this.getUserFromToken(api_token).then(user => {
				if(!user) return reject(false);

				let userService = {};
				if(self.services.has(api_token)) userService = self.services.get(api_token);

				for(let uService in user.Services) {
					if(!user.Services.hasOwnProperty(uService) || !user.Services[uService].Connected) continue;
					if(userService.hasOwnProperty(uService) || !Platforms.hasOwnProperty(uService)) continue;

					const ServiceInfo = user.Services[uService];

					userService[uService] = new Platforms[uService]({
						Username: ServiceInfo.UserServiceInfo.UserName,
						AccessToken: ServiceInfo.AccessToken,
						Channels: [ServiceInfo.UserServiceInfo.ChannelName],
						api_token: api_token
					});

					userService[uService].on('status', status => {
						if(socket) {
							socket.emit('service', {
								Service: uService,
								Status: status
							});
						}
					});

					userService[uService].init({
						onChatMessage: self.onChatMessage.bind(self)
					});
				}

				this.services.set(api_token, userService);

				resolve(true);
			}).catch(() => reject(false));
		});
	}

	/**
	 * Will leave all the platforms the user is authed for
	 * @param channel
	 */
	partChannel(api_token) {
		return new Promise((resolve, reject) => {
			if(!api_token) return reject(false);
			this.getUserFromToken(api_token).then(user => {
				if(!user) return reject(false);

				if(!this.services.has(api_token)) resolve(true);

				let userServices = this.services.get(api_token);

				for(let uService in userServices) {
					if(!userServices.hasOwnProperty(uService) || !userServices[uService].Connected) continue;
					userServices[uService].disconnect();
				}


				this.services.delete(api_token);
			}).catch(() => reject(false));
		});
	}

	getUserFromToken(api_token) {
		const self = this;
		return new Promise((resolve, reject) => {
			if(!api_token) return reject(null);
			if(this.users.has(api_token)) return resolve(this.users.get(api_token));

			UserModel.findOne({ Token: api_token }, (err, user) => {
				if(err || !user) return reject(null);
				self.users.set(api_token, user);
				resolve(user);
			});
		});
	}
}

module.exports = BotManager;