'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by texpe on 17/12/2016.
 */

var Utilities = require('../utilities');
var rp = require('request-promise');

var Twitch = function () {
	function Twitch(options) {
		_classCallCheck(this, Twitch);

		this.Name = "Twitch";
		this.options = options;
		this.tokens = null;
	}

	_createClass(Twitch, [{
		key: 'setTokens',
		value: function setTokens(data) {
			this.tokens = data;
		}
	}, {
		key: 'buildLoginUri',
		value: function buildLoginUri() {
			var opt = this.options;
			var state = Utilities.generateState();
			return {
				URL: opt.LoginURL + '/?client_id=' + opt.ClientId + '&response_type=code&redirect_uri=' + encodeURIComponent(opt.RedirectURL) + '&scope=' + encodeURI(opt.Scopes) + '&state=' + state + '&force_verify=true',
				State: state
			};
		}
	}, {
		key: 'buildAuthUri',
		value: function buildAuthUri(q) {
			var opt = this.options;
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
			};
		}
	}], [{
		key: 'getUserInfo',
		value: function getUserInfo(token) {
			return new Promise(function (resolve, reject) {
				rp({
					uri: 'https://api.twitch.tv/kraken',
					headers: {
						Authorization: 'OAuth ' + token,
						Accept: 'application/vnd.twitchtv.v5+json'
					},
					json: true
				}).then(function (response) {
					resolve({
						UserId: response.token.user_id,
						UserName: response.token.user_name,
						ChannelName: response.token.user_name,
						ChannelId: response.token.user_name
					});
				}).catch(function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'getName',
		value: function getName() {
			return "Twitch";
		}
	}]);

	return Twitch;
}();

module.exports = Twitch;