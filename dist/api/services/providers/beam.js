'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by texpe on 17/12/2016.
 */

var Utilities = require('../utilities');
var rp = require('request-promise');

var Beam = function () {
	function Beam(options) {
		_classCallCheck(this, Beam);

		this.Name = "Beam";
		this.options = options;
		this.tokens = null;
	}

	_createClass(Beam, [{
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
					redirect_uri: opt.RedirectURL,
					client_id: opt.ClientId,
					client_secret: opt.ClientSecret
				},
				Headers: {}
			};
		}
	}], [{
		key: 'getUserInfo',
		value: function getUserInfo(token) {
			return new Promise(function (resolve, reject) {
				rp({
					uri: 'https://beam.pro/api/v1/users/current',
					headers: { Authorization: 'Bearer ' + token },
					json: true
				}).then(function (response) {
					resolve({
						ID: response.id,
						Username: response.username,
						ChannelName: response.channel.token,
						ChannelId: response.channel.id
					});
				}).catch(function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'getName',
		value: function getName() {
			return "Beam";
		}
	}]);

	return Beam;
}();

module.exports = Beam;