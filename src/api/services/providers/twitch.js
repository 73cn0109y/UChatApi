/**
 * Created by texpe on 17/12/2016.
 */

const Utilities = require('../utilities');
const rp = require('request-promise');

class Twitch {
	constructor(options) {
		this.Name = "Twitch";
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
			URL: `${opt.LoginURL}/?client_id=${opt.ClientId}&response_type=code&redirect_uri=${encodeURIComponent(opt.RedirectURL)}&scope=${encodeURI(opt.Scopes)}&state=${state}&force_verify=true`,
			State: state
		};
	}

	buildAuthUri(q) {
		const opt = this.options;
		return {
			URL: opt.AuthorizeURL,
			Body: {
				grant_type: 'authorization_code',
				code: q.code,
				redirect_uri: opt.RedirectURL,
				client_id: opt.ClientId,
				client_secret: opt.ClientSecret
			},
			Headers: {
				//'Authorization': `Basic ${new Buffer(opt.ClientId + ':' + opt.ClientSecret).toString('base64')}`
			}
		}
	}

	static getUserInfo(token) {
		return new Promise((resolve, reject) => {
			rp({
				uri: 'https://api.twitch.tv/kraken',
				headers: {
					Authorization: 'OAuth ' + token,
					Accept: 'application/vnd.twitchtv.v5+json'
				},
				json: true
			}).then(response => {
				resolve({
					UserId: response.token.user_id,
					UserName: response.token.user_name,
					ChannelName: response.token.user_name,
					ChannelId: response.token.user_name
				});
			}).catch(err => {
				reject(err);
			});
		});
	}

	static getName() {
		return "Twitch";
	}
}

module.exports = Twitch;