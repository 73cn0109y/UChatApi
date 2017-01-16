/**
 * Created by texpe on 17/12/2016.
 */

const Utilities = require('../utilities');
const rp = require('request-promise');

class Youtube {
	constructor(options) {
		this.Name = "Youtube";
		this.options = options;
		this.tokens = null;
	}

	setTokens(data) {
		this.tokens = data;
	}

	buildLoginUri() {
		const opt = this.options;
		const state = Utilities.generateState();
		return {
			URL: `${opt.LoginURL}?client_id=${opt.ClientId}&redirect_uri=${encodeURIComponent(opt.RedirectURL)}&scope=${encodeURI(opt.Scopes)}&response_type=code&access_type=offline&state=${state}`,
			State: state
		};
	}

	buildAuthUri(q) {
		const opt = this.options;
		return {
			URL: opt.AuthorizeURL,
			Body: {
				code: q.code,
				client_id: opt.ClientId,
				client_secret: opt.ClientSecret,
				redirect_uri: opt.RedirectURL,
				grant_type: 'authorization_code'
			},
			Headers: {}
		}
	}

	static getName() { return "Youtube"; }

	static getUserInfo(token) {
		return new Promise((resolve, reject) => {
			rp({
				method: 'GET',
				uri: 'https://www.googleapis.com/oauth2/v1/userinfo',
				headers: {
					Authorization: 'Bearer ' + token
				},
				json: true
			}).then(response => {
				let data = {
					UserId: response.id,
					UserName: response.name,
					ChannelName: '',
					ChannelId: ''
				};

				rp({
					method: 'GET',
					uri: 'https://www.googleapis.com/youtube/v3/channels/',
					headers: {
						Authorization: 'Bearer ' + token
					},
					qs: {
						part: 'id,snippet',
						mine: true,
						fields: 'items(id,snippet)'
					},
					json: true
				}).then(response => {
					if(!response || response.items.length <= 0) return resolve(null);

					const item = response.items[0];
					data.ChannelId = item.id;
					data.ChannelName = item.snippet.title;

					resolve(data);
				}).catch(err => {
					console.error(err);
					reject(null);
				});
			}).catch(err => {
				console.error(err);
				reject(null);
			});
		});
	}
}

module.exports = Youtube;