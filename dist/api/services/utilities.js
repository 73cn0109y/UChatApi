'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by texpe on 17/12/2016.
 */

var Utilities = function () {
	function Utilities() {
		_classCallCheck(this, Utilities);
	}

	_createClass(Utilities, null, [{
		key: 'generateState',
		value: function generateState() {
			var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;

			var allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			var r = '';
			for (var i = 0; i < l; i++) {
				r += allowed[Math.floor(Math.random() * allowed.length)];
			}return r;
		}
	}]);

	return Utilities;
}();

module.exports = Utilities;