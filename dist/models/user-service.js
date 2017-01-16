'use strict';

/**
 * Created by texpe on 12/01/2017.
 */

var mongoose = require('mongoose');
var uuid = require('uuid');

var UserServiceInfoSchema = new mongoose.Schema({
	UserId: mongoose.Schema.Types.Mixed,
	UserName: String,
	ChannelName: String,
	ChannelId: mongoose.Schema.Types.Mixed
});

var UserServiceSchema = new mongoose.Schema({
	_id: {
		type: String,
		require: true,
		index: {
			unique: false
		}
	},
	__v: {
		type: Number,
		select: false
	},
	AccessToken: {
		type: String,
		default: ''
	},
	RefreshToken: {
		type: String,
		default: '',
		select: false
	},
	Scopes: {
		type: [String],
		default: []
	},
	Connected: {
		type: Boolean,
		default: false
	},
	UserServiceInfo: UserServiceInfoSchema
});

module.exports = {
	Schema: UserServiceSchema,
	Model: mongoose.model('UserService', UserServiceSchema)
};