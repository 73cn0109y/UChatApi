/**
 * Created by texpe on 16/01/2017.
 */

const io = require('socket.io');
const BotManager = require('./manager');

class SocketServer {
	constructor(app) {
		this.server = io(app, {
			origins: '*:*'
		});

		this.clients = new Map();
		this.botManager = new BotManager({
			onChatMessage: this.emitMessage.bind(this)
		});

		this.initEvents();
	}

	initEvents() {
		this.server.on('connection', socket => {
			const socketInfo = {
				token: socket.handshake.query.token,
				socket: socket
			};
			this.clients.set(socketInfo.token, socket);

			// Socket disconnects... Cleanup
			socket.on('disconnect', () => {
				this.botManager.partChannel(socketInfo.token).then(() => {
					console.log("Client & Platform(s) disconnected!");
				}).catch(err => {
					console.error("Could not disconnect platform(s)!");
				});
				this.clients.delete(socketInfo.token);
			});

			socket.on('join', () => {
				this.botManager.joinChannel(socketInfo.token, socket)
					.then(() => socket.emit('join', true))
					.catch(() => socket.emit('join', false));
			});

			socket.on('part', () => {
				this.botManager.partChannel(socketInfo.token)
					.then(() => socket.emit('part', true))
					.catch(() => socket.emit('part', false));
			});

			socket.on('send', data => {
				if(!data.Message) return;

				this.botManager.sendMessage(socketInfo.token, data.Message);
			});
		});
	}

	emitMessage(api_token, service, channel, userInfo, message) {
		if(!api_token) return console.error('api_token');
		if(!this.clients.has(api_token)) return console.error('missing client');
		this.clients.get(api_token).emit('message', {
			Service: service,
			Channel: channel,
			UserInfo: userInfo,
			Message: message,
			Timestamp: this.humanTimestamp()
		});
	}

	humanTimestamp() {
		const now = new Date();
		let hour = now.getHours(),
			minute = now.getMinutes(),
			isPM = now.getHours() >= 12;
		if(hour > 12) hour -= 12;
		if(hour === 0) hour = 12;
		return (hour < 10 && hour >= 0 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + (isPM ? ' PM' : ' AM');
	}
}

module.exports = SocketServer;