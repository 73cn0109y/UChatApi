'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by texpe on 16/01/2017.
 */

var tmi = require('tmi.js');
var EventEmitter = require('events');

var Twitch = function (_EventEmitter) {
	_inherits(Twitch, _EventEmitter);

	function Twitch() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Twitch);

		var _this = _possibleConstructorReturn(this, (Twitch.__proto__ || Object.getPrototypeOf(Twitch)).call(this));

		_this.Name = 'Twitch';
		_this.Connected = false;
		_this.client = null;
		_this.api_token = options.api_token || null;

		_this.options = {
			options: {
				debug: process.env.NODE_ENV === 'development' // TODO: remove on production
			},
			connection: {
				reconnect: true,
				secure: true
			},
			identity: {
				username: options.Username || '73cn0109y',
				password: 'oauth:' + (options.AccessToken || 'era7vzqv4qx3s0ilo2gxgd1afw7der')
			},
			channels: options.Channels || ['73cn0109y']
		};

		for (var i = 0; i < _this.options.channels.length; i++) {
			if (!_this.options.channels[i].startsWith('#')) _this.options.channels[i] = '#' + _this.options.channels[i];
		}
		return _this;
	}

	_createClass(Twitch, [{
		key: 'init',
		value: function init(callbacks) {
			var _this2 = this;

			this.client = new tmi.client(this.options);
			this.emit('status', 'Connecting');

			this.client.on('connected', function () {
				_this2.Connected = true;
				console.log('Twitch Client Connected!');

				_this2.emit('status', 'Connected');
			});

			this.client.connect();
			this.bindEvents(callbacks);
		}
	}, {
		key: 'bindEvents',
		value: function bindEvents(callbacks) {
			var _this3 = this;

			var self = this;

			this.client.on('chat', function (channel, userstate, message, bot) {
				if (bot) return;

				var userInfo = {
					Username: userstate.username,
					isModerator: userstate.mod,
					isSubscriber: userstate.subscriber,
					isBroadcaster: userstate.badges.hasOwnProperty('broadcaster')
				};

				if (callbacks.onChatMessage) callbacks.onChatMessage(_this3.api_token, _this3.Name, channel.substr(1), userInfo, message);
			});

			this.client.on('cheer', function (channel, userstate, message) {
				var userInfo = {
					Username: userstate.username,
					isModerator: userstate.mod,
					isSubscriber: userstate.subscriber,
					isBroadcaster: userstate.badges.hasOwnProperty('broadcaster')
				};

				var cheerRegex = /(\b|^|\s)cheer(\d+)(\s|$)/ig;

				message = message.replace(cheerRegex, function (match, p1, p2) {
					var color = 'gray';
					p2 = parseInt(p2);

					if (p2 >= 10000) color = 'red';else if (p2 >= 5000) color = 'blue';else if (p2 >= 1000) color = 'green';else if (p2 >= 100) color = 'purple';

					return '<img src="http://static-cdn.jtvnw.net/bits/dark/animated/' + color + '/1" class="twitch-cheer">';
				});

				if (callbacks.onChatMessage) callbacks.onChatMessage(_this3.api_token, _this3.Name, channel.substr(1), userInfo, message);
			});
		}
	}, {
		key: 'sendMessage',
		value: function sendMessage(message) {
			var channel = this.options.channels[0];
			if (!channel.startsWith('#')) channel = '#' + channel;

			this.client.say(channel, message);
		}
	}, {
		key: 'joinChannel',
		value: function joinChannel(channel) {
			this.client.join(channel);
			this.options.channels.push(channel);
		}
	}, {
		key: 'partChannel',
		value: function partChannel(channel) {
			if (!channel || this.options.channels.indexOf(channel) < 0) return;

			this.client.part(channel);
			this.options.channels.splice(this.options.channels.indexOf(channel), 1);
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {
			this.client.disconnect();
			this.Connected = false;
			this.emit('status', 'Disconnected');
		}
	}], [{
		key: 'getName',
		value: function getName() {
			return 'Twitch';
		}
	}]);

	return Twitch;
}(EventEmitter);

module.exports = Twitch;