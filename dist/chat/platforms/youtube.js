'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by texpe on 16/01/2017.
 */

var ymi = require('ymi.js');
var google = require('googleapis');
var rp = require('request-promise');
var EventEmitter = require('events');

var config = {
	oauth: {
		client_id: '',
		client_secret: '',
		refresh_token: '',
		access_token: ''
	},
	live_chat_id: '',
	page_token: null
};
var host = process.env.OPENSHIFT_APP_DNS || 'http://localhost:8080';

var Youtube = function (_EventEmitter) {
	_inherits(Youtube, _EventEmitter);

	function Youtube() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Youtube);

		var _this = _possibleConstructorReturn(this, (Youtube.__proto__ || Object.getPrototypeOf(Youtube)).call(this));

		_this.Name = 'Youtube';
		_this.Connected = false;
		_this.client = null;
		_this.options = options;
		_this.api_token = options.api_token || null;

		_this.config = {
			oauth: {
				client_id: config.oauth.client_id,
				client_secret: config.oauth.client_secret,
				refresh_token: options.RefreshToken,
				access_token: options.AccessToken
			},
			live_chat_id: null,
			page_token: null
		};
		return _this;
	}

	_createClass(Youtube, [{
		key: 'init',
		value: function init(callbacks) {
			var _this2 = this;

			this.emit('status', 'Connecting');
			if (!this.options.live_chat_id) {
				this.resolveChatId(this.options.ChannelId, this.setup.bind(this)).then(function (chatId) {
					return _this2.setup(callbacks, chatId);
				}).catch(function (err) {
					console.error("Youtube Chat ID not found or unknown error!");
					_this2.emit('status', 'Error');
				});
			} else this.setup(callbacks);
		}
	}, {
		key: 'setup',
		value: function setup(callbacks) {
			var _this3 = this;

			var chatId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			if (!chatId && !this.config.live_chat_id) return console.error('No Youtube Chat ID!');
			if (chatId !== null) this.config.live_chat_id = chatId;

			this.client = new ymi.client(this.config);

			this.client.on('connected', function () {
				console.log('Youtube Client Connected!');
				_this3.Connected = true;

				_this3.emit('status', 'Connected');
			});

			this.bindEvents(callbacks);
			this.client.connect();
		}
	}, {
		key: 'bindEvents',
		value: function bindEvents(callbacks) {
			var _this4 = this;

			this.client.on('chat', function (user, message) {
				var userInfo = {
					Username: user.displayName,
					isModerator: false,
					isSubscriber: false,
					isBroadcaster: false
				};

				if (callbacks.onChatMessage) callbacks.onChatMessage(_this4.api_token, _this4.Name, self.channels[0].channelName, userInfo, message.displayMessage);
			});
		}
	}, {
		key: 'resolveChatId',
		value: function resolveChatId(channelId) {
			var self = this;

			return new Promise(function (resolve, reject) {
				var client = new google.auth.OAuth2(config.oauth.client_id, config.oauth.client_secret, host + '/api/services/authorize/youtube');
				client.setCredentials({
					access_token: self.config.oauth.access_token,
					refresh_token: self.config.oauth.refresh_token
				});

				var youtube = google.youtube({
					version: 'v3',
					auth: client
				});

				youtube.search.list({
					part: 'snippet',
					channelId: channelId,
					eventType: 'live',
					maxResults: 1,
					order: 'date',
					type: 'video',
					fields: 'items(id(videoId))'
				}, function (err, data) {
					if (err || data.items.length <= 0) return reject(null);

					var latestStreamId = data.items[0].id.videoId;

					youtube.videos.list({
						part: 'liveStreamingDetails',
						id: latestStreamId,
						maxResults: 1,
						fields: 'items(id,liveStreamingDetails(activeLiceChatId))'
					}, function (err, data) {
						if (err || data.items.length <= 0) return reject(null);

						resolve(data.items[0].liveStreamingDetails.activeLiveChatId);
					});
				});
			});
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
			return 'Youtube';
		}
	}]);

	return Youtube;
}(EventEmitter);

module.exports = Youtube;