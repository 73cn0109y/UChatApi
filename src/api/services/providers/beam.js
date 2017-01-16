/**
 * Created by texpe on 17/12/2016.
 */

const Utilities = require('../utilities');
const rp = require('request-promise');

class Beam {
	constructor(options) {
		this.Name = "Beam";
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
			URL: `${opt.LoginURL}/?client_id=${opt.ClientId}&response_type=code&redirect_uri=${encodeURIComponent(opt.RedirectURL)}&scope=${encodeURI(opt.Scopes)}&state=${state}`,
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
			Headers: {}
		}
	}

	static getUserInfo(token) {
		return new Promise((resolve, reject) => {
			rp({
				uri: 'https://beam.pro/api/v1/users/current',
				headers: { Authorization: 'Bearer ' + token },
				json: true
			}).then(response => {
				resolve({
					ID: response.id,
					Username: response.username,
					ChannelName: response.channel.token,
					ChannelId: response.channel.id
				});
			}).catch(err => {
				reject(err);
			});
		});
	}

	static getName() { return "Beam"; }
}

module.exports = Beam;