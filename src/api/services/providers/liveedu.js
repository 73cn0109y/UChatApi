/**
 * Created by texpe on 17/12/2016.
 */

const Utilities = require('../utilities');
const rp = require('request-promise');

class Liveedu {
	constructor(options) {
		this.Name = "Liveedu";
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
				redirect_uri: opt.RedirectURL
			},
			Headers: {
				'Authorization': `Basic ${new Buffer(opt.ClientId + ':' + opt.ClientSecret).toString('base64')}`
			}
		}
	}

	static getUserInfo(token) {
		return new Promise((resolve, reject) => {
			rp({
				uri: 'https://www.liveedu.tv:443/api/user/',
				headers: { Authorization: 'Bearer ' + token },
				json: true
			}).then(response => {
				resolve({
					UserId: response.slug,
					UserName: response.username,
					ChannelName: response.slug,
					ChannelId: null
				});
			}).catch(err => {
				reject(err);
			});
		});
	}

	static getName() {
		return "Liveedu";
	}
}

module.exports = Liveedu;