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
	},
	MessageBack: {
		type: String,
		default: 'rgba(0, 50, 175, 0.3)'
	},
	MessageMentionBack: {
		type: String,
		default: 'rgba(255, 75, 75, 0.4)'
	}
});

module.exports = mongoose.model('Settings', SettingsSchema);