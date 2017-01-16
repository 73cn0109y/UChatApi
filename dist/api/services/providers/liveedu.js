'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by texpe on 17/12/2016.
 */

var Utilities = require('../utilities');
var rp = require('request-promise');

var Liveedu = function () {
	function Liveedu(options) {
		_classCallCheck(this, Liveedu);

		this.Name = "Liveedu";
		this.options = options;
		this.tokens = null;
	}

	_createClass(Liveedu, [{
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
				URL: opt.LoginURL + '/?client_id=' + opt.ClientId + '&response_type=code&redirect_uri=' + encodeURIComponent(opt.RedirectURL) + '&scope=' + encodeURI(opt.Scopes) + '&state=' + state,
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
					redirect_uri: opt.RedirectURL
				},
				Headers: {
					'Authorization': 'Basic ' + new Buffer(opt.ClientId + ':' + opt.ClientSecret).toString('base64')
				}
			};
		}
	}], [{
		key: 'getUserInfo',
		value: function getUserInfo(token) {
			return new Promise(function (resolve, reject) {
				rp({
					uri: 'https://www.liveedu.tv:443/api/user/',
					headers: { Authorization: 'Bearer ' + token },
					json: true
				}).then(function (response) {
					resolve({
						UserId: response.slug,
						UserName: response.username,
						ChannelName: response.slug,
						ChannelId: null
					});
				}).catch(function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'getName',
		value: function getName() {
			return "Liveedu";
		}
	}]);

	return Liveedu;
}();

module.exports = Liveedu;