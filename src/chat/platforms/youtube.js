/**
 * Created by texpe on 16/01/2017.
 */

const ymi = require('ymi.js');
const google = require('googleapis');
const rp = require('request-promise');
const EventEmitter = require('events');

const config = {
	oauth: {
		client_id: '',
		client_secret: '',
		refresh_token: '',
		access_token: ''
	},
	live_chat_id: '',
	page_token: null
};
const host = process.env.OPENSHIFT_APP_DNS || 'http://localhost:8080';

class Youtube extends EventEmitter {
	constructor(options = {}) {
		super();
		this.Name = 'Youtube';
		this.Connected = false;
		this.client = null;
		this.options = options;
		this.api_token = options.api_token || null;

		this.config = {
			oauth: {
				client_id: config.oauth.client_id,
				client_secret: config.oauth.client_secret,
				refresh_token: options.RefreshToken,
				access_token: options.AccessToken
			},
			live_chat_id: null,
			page_token: null
		};
	}

	init(callbacks,) {
		this.emit('status', 'Connecting');
		if(!this.options.live_chat_id) {
			this.resolveChatId(this.options.ChannelId, this.setup.bind(this))
				.then(chatId => this.setup(callbacks, chatId))
				.catch(err => {
					console.error("Youtube Chat ID not found or unknown error!");
					this.emit('status', 'Error');
				});
		} else this.setup(callbacks);
	}

	setup(callbacks, chatId = null) {
		if(!chatId && !this.config.live_chat_id) return console.error('No Youtube Chat ID!');
		if(chatId !== null) this.config.live_chat_id = chatId;

		this.client = new ymi.client(this.config);

		this.client.on('connected', () => {
			console.log('Youtube Client Connected!');
			this.Connected = true;

			this.emit('status', 'Connected');
		});

		this.bindEvents(callbacks);
		this.client.connect();
	}

	bindEvents(callbacks) {
		this.client.on('chat', (user, message) => {
			let userInfo = {
				Username: user.displayName,
				isModerator: false,
				isSubscriber: false,
				isBroadcaster: false
			};

			if(callbacks.onChatMessage)
				callbacks.onChatMessage(this.api_token, this.Name, self.channels[0].channelName, userInfo, message.displayMessage);
		});
	}

	resolveChatId(channelId) {
		const self = this;

		return new Promise((resolve, reject) => {
			const client = new google.auth.OAuth2(
				config.oauth.client_id,
				config.oauth.client_secret,
				host + '/api/services/authorize/youtube'
			);
			client.setCredentials({
				access_token: self.config.oauth.access_token,
				refresh_token: self.config.oauth.refresh_token
			});

			const youtube = google.youtube({
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
			}, (err, data) => {
				if(err || data.items.length <= 0) return reject(null);

				const latestStreamId = data.items[0].id.videoId;

				youtube.videos.list({
					part: 'liveStreamingDetails',
					id: latestStreamId,
					maxResults: 1,
					fields: 'items(id,liveStreamingDetails(activeLiceChatId))'
				}, (err, data) => {
					if(err || data.items.length <= 0) return reject(null);

					resolve(data.items[0].liveStreamingDetails.activeLiveChatId);
				});
			});
		});
	}

	disconnect() {
		this.client.disconnect();
		this.Connected = false;

		this.emit('status', 'Disconnected');
	}

	static getName() {
		return 'Youtube';
	}
}

module.exports = Youtube;