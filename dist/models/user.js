'use strict';

/**
 * Created by texpe on 12/01/2017.
 */

var mongoose = require('mongoose');
var uuid = require('uuid');
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var UserService = require('./user-service');

var UserSchema = new mongoose.Schema({
	_id: {
		type: String,
		require: true,
		index: {
			unique: true
		},
		default: function _default() {
			return uuid();
		}
	},
	__v: {
		type: Number,
		select: false
	},
	Name: {
		type: String,
		required: true
	},
	Email: {
		type: String,
		required: true,
		unique: true
	},
	Password: {
		type: String,
		required: true,
		select: false
	},
	Created: {
		type: Date,
		default: function _default() {
			return Date.now();
		}
	},
	Token: {
		type: String,
		unique: true
	},
	Services: {
		type: Object,
		default: {
			Youtube: new UserService.Model(),
			Twitch: new UserService.Model(),
			Liveedu: new UserService.Model(),
			Beam: new UserService.Model()
		}
	}
});

UserSchema.pre('save', function (next) {
	var user = this;
	if (!user.isModified('Password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.Password, salt, function (err, hash) {
			if (err) return next(err);

			user.Password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function (candidatePassword, callback) {
	bcrypt.compare(candidatePassword, this.Password, function (err, isMatch) {
		if (err) return callback(err);
		callback(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserSchema);