/**
 * Created by texpe on 16/01/2017.
 */

const tmi          = require('tmi.js');
const EventEmitter = require('events');

class Twitch extends EventEmitter {
	constructor(options = {}) {
		super();
		this.Name      = 'Twitch';
		this.Connected = false;
		this.client    = null;
		this.api_token = options.api_token || null;

		this.options = {
			options   : {
				debug: (process.env.NODE_ENV === 'development') // TODO: remove on production
			},
			connection: {
				reconnect: true,
				secure   : true,
			},
			identity  : {
				username: options.Username || '73cn0109y',
				password: 'oauth:' + (options.AccessToken || 'era7vzqv4qx3s0ilo2gxgd1afw7der'),
			},
			channels  : options.Channels || [ '73cn0109y' ],
		};

		for (let i = 0; i < this.options.channels.length; i++) {
			if (!this.options.channels[ i ].startsWith('#'))
				this.options.channels[ i ] = '#' + this.options.channels[ i ];
		}
	}

	init(callbacks) {
		this.client = new tmi.client(this.options);
		this.emit('status', 'Connecting');

		this.client.on('connected', () => {
			this.Connected = true;
			console.log('Twitch Client Connected!');

			this.emit('status', 'Connected');
		});

		this.client.connect();
		this.bindEvents(callbacks);
	}

	bindEvents(callbacks) {
		let self = this;

		this.client.on('chat', (channel, userstate, message, bot) => {
			if (bot) return;

			let userInfo = {
				Username     : userstate.username,
				isModerator  : userstate.mod,
				isSubscriber : userstate.subscriber,
				isBroadcaster: userstate.badges.hasOwnProperty('broadcaster'),
			};

			if (callbacks.onChatMessage)
				callbacks.onChatMessage(this.api_token, this.Name, channel.substr(1), userInfo, message);
		});

		this.client.on('cheer', (channel, userstate, message) => {
			console.log('[Cheer]' + userstate.username + ': ' + message);

			const userInfo = {
				Username     : userstate.username,
				isModerator  : userstate.mod,
				isSubscriber : userstate.subscriber,
				isBroadcaster: userstate.badges.hasOwnProperty('broadcaster'),
			};

			const cheerRegex = (/(\b|^|\s)cheer(\d+)(\s|$)/ig);

			message = message.replace(cheerRegex, (match, p1, p2) => {
				let color = 'gray';
				p2        = parseInt(p2);

				if (p2 >= 10000) color = 'red';
				else if (p2 >= 5000) color = 'blue';
				else if (p2 >= 1000) color = 'green';
				else if (p2 >= 100) color = 'purple';

				return `<img src="http://static-cdn.jtvnw.net/bits/dark/animated/${color}/1" class="twitch-cheer">`;
			});

			if (callbacks.onChatMessage)
				callbacks.onChatMessage(this.api_token, this.Name, channel.substr(1), userInfo, message);
		});
	}

	sendMessage(message) {
		let channel = this.options.channels[ 0 ];
		if (!channel.startsWith('#')) channel = '#' + channel;

		this.client.say(channel, message);
	}

	joinChannel(channel) {
		this.client.join(channel);
		this.options.channels.push(channel);
	}

	partChannel(channel) {
		if (!channel || this.options.channels.indexOf(channel) < 0) return;

		this.client.part(channel);
		this.options.channels.splice(this.options.channels.indexOf(channel), 1);
	}

	disconnect() {
		this.client.disconnect();
		this.Connected = false;
		this.emit('status', 'Disconnected');
	}

	static getName() {
		return 'Twitch';
	}
}

module.exports = Twitch;