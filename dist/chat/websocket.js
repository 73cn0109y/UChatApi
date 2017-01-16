'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by texpe on 16/01/2017.
 */

var io = require('socket.io');
var BotManager = require('./manager');

var SocketServer = function () {
	function SocketServer(app) {
		_classCallCheck(this, SocketServer);

		this.server = io(app, {
			origins: '*:*'
		});

		this.clients = new Map();
		this.botManager = new BotManager({
			onChatMessage: this.emitMessage.bind(this)
		});

		this.initEvents();
	}

	_createClass(SocketServer, [{
		key: 'initEvents',
		value: function initEvents() {
			var _this = this;

			this.server.on('connection', function (socket) {
				var socketInfo = {
					token: socket.handshake.query.token,
					socket: socket
				};
				_this.clients.set(socketInfo.token, socket);

				// Socket disconnects... Cleanup
				socket.on('disconnect', function () {
					_this.botManager.partChannel(socketInfo.token).then(function () {
						console.log("Client & Platform(s) disconnected!");
					}).catch(function (err) {
						console.error("Could not disconnect platform(s)!");
					});
					_this.clients.delete(socketInfo.token);
				});

				socket.on('join', function () {
					_this.botManager.joinChannel(socketInfo.token, socket).then(function () {
						return socket.emit('join', true);
					}).catch(function () {
						return socket.emit('join', false);
					});
				});

				socket.on('part', function () {
					_this.botManager.partChannel(socketInfo.token).then(function () {
						return socket.emit('part', true);
					}).catch(function () {
						return socket.emit('part', false);
					});
				});

				socket.on('send', function (data) {
					if (!data.Message) return;

					_this.botManager.sendMessage(socketInfo.token, data.Message);
				});
			});
		}
	}, {
		key: 'emitMessage',
		value: function emitMessage(api_token, service, channel, userInfo, message) {
			if (!api_token) return console.error('api_token');
			if (!this.clients.has(api_token)) return console.error('missing client');
			this.clients.get(api_token).emit('message', {
				Service: service,
				Channel: channel,
				UserInfo: userInfo,
				Message: message,
				Timestamp: this.humanTimestamp()
			});
		}
	}, {
		key: 'humanTimestamp',
		value: function humanTimestamp() {
			var now = new Date();
			var hour = now.getHours(),
			    minute = now.getMinutes(),
			    isPM = now.getHours() >= 12;
			if (hour > 12) hour -= 12;
			if (hour === 0) hour = 12;
			return (hour < 10 && hour >= 0 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + (isPM ? ' PM' : ' AM');
		}
	}]);

	return SocketServer;
}();

module.exports = SocketServer;