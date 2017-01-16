'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by texpe on 17/12/2016.
 */

var Utilities = require('../utilities');
var rp = require('request-promise');

var Youtube = function () {
	function Youtube(options) {
		_classCallCheck(this, Youtube);

		this.Name = "Youtube";
		this.options = options;
		this.tokens = null;
	}

	_createClass(Youtube, [{
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
				URL: opt.LoginURL + '?client_id=' + opt.ClientId + '&redirect_uri=' + encodeURIComponent(opt.RedirectURL) + '&scope=' + encodeURI(opt.Scopes) + '&response_type=code&access_type=offline&state=' + state,
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
					code: q.code,
					client_id: opt.ClientId,
					client_secret: opt.ClientSecret,
					redirect_uri: opt.RedirectURL,
					grant_type: 'authorization_code'
				},
				Headers: {}
			};
		}
	}], [{
		key: 'getName',
		value: function getName() {
			return "Youtube";
		}
	}, {
		key: 'getUserInfo',
		value: function getUserInfo(token) {
			return new Promise(function (resolve, reject) {
				rp({
					method: 'GET',
					uri: 'https://www.googleapis.com/oauth2/v1/userinfo',
					headers: {
						Authorization: 'Bearer ' + token
					},
					json: true
				}).then(function (response) {
					var data = {
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
					}).then(function (response) {
						if (!response || response.items.length <= 0) return resolve(null);

						var item = response.items[0];
						data.ChannelId = item.id;
						data.ChannelName = item.snippet.title;

						resolve(data);
					}).catch(function (err) {
						console.error(err);
						reject(null);
					});
				}).catch(function (err) {
					console.error(err);
					reject(null);
				});
			});
		}
	}]);

	return Youtube;
}();

module.exports = Youtube;