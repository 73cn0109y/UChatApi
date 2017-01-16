'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by texpe on 16/01/2017.
 */

var UserModel = require('../models/user');
var Platforms = {};

// Dynamically load all platforms
// Saves us from having to import them manually
(function () {
	require('fs').readdirSync(__dirname + '/platforms').forEach(function (file) {
		if (file === 'utilties.js') return;

		var module = require(__dirname + '/platforms/' + file);
		if (module.hasOwnProperty('getName')) Platforms[module.getName()] = module;
	});
})();

var BotManager = function () {
	function BotManager(callbacks) {
		_classCallCheck(this, BotManager);

		this.channels = [];
		this.users = new Map();
		this.services = new Map();
		this.ignoreUsers = ['revlobot', 'nightbot', '73cn0b0t'];
		this.history = [];
		this.callbacks = callbacks;
	}

	_createClass(BotManager, [{
		key: 'onChatMessage',
		value: function onChatMessage(api_token, serviceName, channel, userInfo, message) {
			var _this = this;

			channel = channel.toLowerCase();

			//if(this.ignoreUsers.indexOf(userInfo.Username.toLowerCase()) >= 0) return;

			var user = this.getUserFromToken(api_token).then(function (user) {
				if (userInfo.Username.toLowerCase() === user.Services[serviceName].UserServiceInfo.UserName.toLowerCase()) {
					serviceName = 'broadcaster';
					userInfo = {
						Username: 'Broadcaster',
						isModerator: false,
						isSubscriber: false,
						isBroadcaster: true
					};
				}

				_this.callbacks.onChatMessage(api_token, serviceName, channel, userInfo, message);
			}).catch(function (err) {
				_this.callbacks.onChatMessage(api_token, serviceName, channel, userInfo, message);
			});
		}

		/**
   * Will send a message to all authorized platforms
   * @param channel
   * @param message
   */

	}, {
		key: 'sendMessage',
		value: function sendMessage(api_token, message) {
			var _this2 = this;

			var excludeService = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			return new Promise(function (resolve, reject) {
				if (!api_token || !message) return reject(false);

				var services = _this2.services.get(api_token);

				for (var service in services) {
					if (!services.hasOwnProperty(service) || !services[service].Connected) continue;
					if (excludeService === service) continue;
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

	}, {
		key: 'joinChannel',
		value: function joinChannel(api_token) {
			var _this3 = this;

			var socket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			var self = this;

			return new Promise(function (resolve, reject) {
				if (!api_token) return reject(false);

				_this3.getUserFromToken(api_token).then(function (user) {
					if (!user) return reject(false);

					var userService = {};
					if (self.services.has(api_token)) userService = self.services.get(api_token);

					var _loop = function _loop(uService) {
						if (!user.Services.hasOwnProperty(uService) || !user.Services[uService].Connected) return 'continue';
						if (userService.hasOwnProperty(uService) || !Platforms.hasOwnProperty(uService)) return 'continue';

						var ServiceInfo = user.Services[uService];

						userService[uService] = new Platforms[uService]({
							Username: ServiceInfo.UserServiceInfo.UserName,
							AccessToken: ServiceInfo.AccessToken,
							Channels: [ServiceInfo.UserServiceInfo.ChannelName],
							api_token: api_token
						});

						userService[uService].on('status', function (status) {
							if (socket) {
								socket.emit('service', {
									Service: uService,
									Status: status
								});
							}
						});

						userService[uService].init({
							onChatMessage: self.onChatMessage.bind(self)
						});
					};

					for (var uService in user.Services) {
						var _ret = _loop(uService);

						if (_ret === 'continue') continue;
					}

					_this3.services.set(api_token, userService);

					resolve(true);
				}).catch(function () {
					return reject(false);
				});
			});
		}

		/**
   * Will leave all the platforms the user is authed for
   * @param channel
   */

	}, {
		key: 'partChannel',
		value: function partChannel(api_token) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {
				if (!api_token) return reject(false);
				_this4.getUserFromToken(api_token).then(function (user) {
					if (!user) return reject(false);

					if (!_this4.services.has(api_token)) resolve(true);

					var userServices = _this4.services.get(api_token);

					for (var uService in userServices) {
						if (!userServices.hasOwnProperty(uService) || !userServices[uService].Connected) continue;
						userServices[uService].disconnect();
					}

					_this4.services.delete(api_token);
				}).catch(function () {
					return reject(false);
				});
			});
		}
	}, {
		key: 'getUserFromToken',
		value: function getUserFromToken(api_token) {
			var _this5 = this;

			var self = this;
			return new Promise(function (resolve, reject) {
				if (!api_token) return reject(null);
				if (_this5.users.has(api_token)) return resolve(_this5.users.get(api_token));

				UserModel.findOne({ Token: api_token }, function (err, user) {
					if (err || !user) return reject(null);
					self.users.set(api_token, user);
					resolve(user);
				});
			});
		}
	}]);

	return BotManager;
}();

module.exports = BotManager;