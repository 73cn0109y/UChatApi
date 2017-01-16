'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by texpe on 16/01/2017.
 */

var Client = require('node-xmpp-client');
var rp = require('request-promise');
var EventEmitter = require('events');

var Liveedu = function (_EventEmitter) {
	_inherits(Liveedu, _EventEmitter);

	function Liveedu() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Liveedu);

		var _this = _possibleConstructorReturn(this, (Liveedu.__proto__ || Object.getPrototypeOf(Liveedu)).call(this));

		_this.Name = 'Liveedu';
		_this.Connected = false;
		_this.api_token = options.api_token || null;

		_this.options = {
			username: options.Username || '73cn0109y',
			jid: (options.Username || '73cn0109y') + '@livecoding.tv',
			password: options.AccessToken || ''
		};
		_this.hasAccessToken = options.hasOwnProperty('AccessToken');
		_this.roomInfo = {
			Rooms: options.Channels || [],
			RoomJid: '@chat.livecoding.tv'
		};
		return _this;
	}

	_createClass(Liveedu, [{
		key: 'init',
		value: function init(callbacks) {
			var self = this;
			this.emit('status', 'Connecting');

			if (this.hasAccessToken) {
				rp({
					uri: 'https://www.liveedu.tv:443/api/user/chat/account/',
					method: 'GET',
					headers: { Authorization: 'Bearer ' + this.options.password },
					json: true
				}).then(function (response) {
					self.options.password = response.password;
					self.connect(callbacks);
				}).catch(function (err) {
					return console.error(err);
				});
			} else this.connect(callbacks);
		}
	}, {
		key: 'connect',
		value: function connect(callbacks) {
			var _this2 = this;

			this.client = new Client(this.options);

			this.client.on('err', function (err) {
				return console.error(err);
			});
			this.client.on('online', function () {
				_this2.emit('status', 'Connected');
			});

			this.bindEvents(callbacks);
		}
	}, {
		key: 'bindEvents',
		value: function bindEvents(callbacks) {
			var _this3 = this;

			var self = this;

			this.client.on('online', function () {
				console.log("Livecoding Client Online");
				self.Connected = true;

				for (var i = 0; i < self.roomInfo.Rooms.length; i++) {
					self.joinChannel(self.roomInfo.Rooms[i]);
				}
			});

			this.client.on('stanza', function (stanza) {
				if (stanza.name === 'message') {
					var body = self.findChild('body', stanza.children);
					if (!body) return;
					var message = body.children.join('').replace('\\', '');
					var channel = stanza.attrs.from.substr(0, stanza.attrs.from.indexOf('@'));
					var username = stanza.attrs.from;
					username = username.substr(username.lastIndexOf('/') + 1, username.length - username.lastIndexOf('/') - 1);
					var userInfo = {
						Username: username,
						isModerator: false,
						isSubscriber: false,
						isBroadcaster: channel.toLowerCase() === username.toLowerCase()
					};

					if (self.findChild('delay', stanza.children) === null) {
						if (callbacks.onChatMessage) callbacks.onChatMessage(_this3.api_token, _this3.Name, channel, userInfo, message);
					}
				}
			});
		}
	}, {
		key: 'findChild',
		value: function findChild(name, children) {
			var result = null;
			for (var index in children) {
				var child = children[index];
				if (child.name === name) {
					result = child;
					break;
				}
			}
			return result;
		}
	}, {
		key: 'sendMessage',
		value: function sendMessage(message) {
			var stanza = new Client.Stanza('message', {
				to: this.roomInfo.Rooms[0] + this.roomInfo.RoomJid,
				type: 'groupchat'
			});
			stanza.c('body').t(message);
			this.client.send(stanza);
		}
	}, {
		key: 'joinChannel',
		value: function joinChannel(channel) {
			this.client.send(new Client.Stanza('presence', {
				to: channel + this.roomInfo.RoomJid + '/' + this.options.username
			}));
		}
	}, {
		key: 'partChannel',
		value: function partChannel(channel) {
			if (this.roomInfo.Rooms.indexOf(channel) < 0) return;

			this.roomInfo.Rooms.splice(this.roomInfo.indexOf(channel), 1);
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {
			this.client.end(); // Causes ECONNRESET to be thrown and crashes the server
			this.Connected = false;
			this.emit('status', 'Disconnected');
		}
	}], [{
		key: 'getName',
		value: function getName() {
			return 'Liveedu';
		}
	}]);

	return Liveedu;
}(EventEmitter);

module.exports = Liveedu;