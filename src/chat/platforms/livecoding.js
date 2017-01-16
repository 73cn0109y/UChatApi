/**
 * Created by texpe on 16/01/2017.
 */

const Client = require('node-xmpp-client');
const rp = require('request-promise');
const EventEmitter = require('events');

class Liveedu extends EventEmitter {
	constructor(options = {}) {
		super();
		this.Name = 'Liveedu';
		this.Connected = false;
		this.api_token = options.api_token || null;

		this.options = {
			username: options.Username || '73cn0109y',
			jid: (options.Username || '73cn0109y') + '@livecoding.tv',
			password: options.AccessToken || ''
		};
		this.hasAccessToken = options.hasOwnProperty('AccessToken');
		this.roomInfo = {
			Rooms: options.Channels || [],
			RoomJid: '@chat.livecoding.tv'
		};
	}

	init(callbacks) {
		let self = this;
		this.emit('status', 'Connecting');

		if(this.hasAccessToken) {
			rp({
				uri: 'https://www.liveedu.tv:443/api/user/chat/account/',
				method: 'GET',
				headers: { Authorization: 'Bearer ' + this.options.password },
				json: true
			}).then(response => {
				self.options.password = response.password;
				self.connect(callbacks);
			}).catch(err => console.error(err));
		} else this.connect(callbacks);
	}

	connect(callbacks) {
		this.client = new Client(this.options);

		this.client.on('err', err => console.error(err));
		this.client.on('online', () => {
			this.emit('status', 'Connected');
		});

		this.bindEvents(callbacks);
	}

	bindEvents(callbacks) {
		let self = this;

		this.client.on('online', () => {
			console.log("Livecoding Client Online");
			self.Connected = true;

			for(let i = 0; i < self.roomInfo.Rooms.length; i++) {
				self.joinChannel(self.roomInfo.Rooms[i]);
			}
		});

		this.client.on('stanza', stanza => {
			if(stanza.name === 'message') {
				let body = self.findChild('body', stanza.children);
				if(!body) return;
				let message = body.children.join('').replace('\\', '');
				let channel = stanza.attrs.from.substr(0, stanza.attrs.from.indexOf('@'));
				let username = stanza.attrs.from;
				username = username.substr(username.lastIndexOf('/') + 1, username.length - username.lastIndexOf('/') - 1);
				let userInfo = {
					Username: username,
					isModerator: false,
					isSubscriber: false,
					isBroadcaster: (channel.toLowerCase() === username.toLowerCase())
				};

				if(self.findChild('delay', stanza.children) === null) {
					if(callbacks.onChatMessage)
						callbacks.onChatMessage(this.api_token, this.Name, channel, userInfo, message);
				}
			}
		});
	}

	findChild(name, children) {
		let result = null;
		for(let index in children) {
			let child = children[index];
			if(child.name === name) {
				result = child;
				break;
			}
		}
		return result;
	}

	sendMessage(message) {
		let stanza = new Client.Stanza('message', {
			to: this.roomInfo.Rooms[0] + this.roomInfo.RoomJid,
			type: 'groupchat'
		});
		stanza.c('body').t(message);
		this.client.send(stanza);
	}

	joinChannel(channel) {
		this.client.send(new Client.Stanza('presence', {
			to: channel + this.roomInfo.RoomJid + '/' + this.options.username
		}));
	}

	partChannel(channel) {
		if(this.roomInfo.Rooms.indexOf(channel) < 0) return;

		this.roomInfo.Rooms.splice(this.roomInfo.indexOf(channel), 1);
	}

	disconnect() {
		this.client.end(); // Causes ECONNRESET to be thrown and crashes the server
		this.Connected = false;
		this.emit('status', 'Disconnected');
	}

	static getName() {
		return 'Liveedu';
	}
}

module.exports = Liveedu;