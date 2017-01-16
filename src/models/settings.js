/**
 * Created by texpe on 16/01/2017.
 */

const mongoose = require('mongoose');
const uuid = require('uuid');

let SettingsSchema = new mongoose.Schema({
	_id: {
		type: String,
		require: true,
		index: {
			unique: true
		},
		default: function() {
			return uuid();
		}
	},
	__v: {
		type: Number,
		select: false
	},
	Token: {
		type: String,
		required: true
	},
	ChromaKey: {
		type: String,
		default: 'Green'
	}
});

module.exports = mongoose.model('Settings', SettingsSchema);