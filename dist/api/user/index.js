'use strict';

/**
 * Created by texpe on 12/01/2017.
 */

var UserModel = require('../../models/user');

var User = {
	login: function login(data, callback) {
		if (typeof data.email !== 'string' || typeof data.password !== 'string') return callback({ success: false, error: "Incorrect Email/Password!" });

		UserModel.findOne({ Email: data.email }, '_id Email Password Created Services Token', function (err, user) {
			if (err) {
				if (callback) callback({ success: false, error: err }, 500);
				return;
			}
			if (!user) {
				if (callback) callback({ success: false, error: "Invalid Username/Password!" });
				return;
			}

			user.comparePassword(data.password, function (err, isMatch) {
				if (err) {
					if (callback) callback({ success: false, error: err });
					return;
				}
				if (callback) {
					if (isMatch) callback({ success: true, user: user });else callback({ success: false, error: "Incorrect Username/Password!" });
				}
			});
		});
	},
	register: function register(data, callback) {
		if (typeof data.email !== 'string' || typeof data.password !== 'string') return callback({ success: false, error: "Please fill in all required fields!" });

		var user = new UserModel({
			Name: data.name,
			Email: data.email,
			Password: data.password,
			Token: randomString()
		});

		user.save(function (err) {
			console.log(err);
			if (callback) {
				if (err) callback({ success: false, error: err.errmsg });else callback({ success: true, user: user });
			} else console.error(err);
		});
	}
};

var randomString = function randomString() {
	var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;

	var allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var r = '';
	for (var i = 0; i < len; i++) {
		r += allowed[Math.floor(Math.random() * allowed.length)];
	}return r;
};

module.exports = User;