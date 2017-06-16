/**
 * Created by texpe on 12/01/2017.
 */

const UserModel = require('../../models/user');
const SettingsModel = require('../../models/settings');

let User = {
	login: (data, callback) => {
		if(typeof data.email !== 'string' || typeof data.password !== 'string')
			return callback({ success: false, error: "Incorrect Email/Password!" });

		UserModel.findOne({ Email: data.email }, '_id Email Password Created Services Token', (err, user) => {
			if(err) {
				if(callback) callback({ success: false, error: err }, 500);
				return;
			}
			if(!user) {
				if(callback) callback({ success: false, error: "Invalid Username/Password!" });
				return;
			}

			user.comparePassword(data.password, (err, isMatch) => {
				if(err) {
					if(callback) callback({ success: false, error: err });
					return;
				}
				if(callback) {
					if(isMatch) callback({ success: true, user: user });
					else callback({ success: false, error: "Incorrect Username/Password!" });
				}
			});
		});
	},
	register: (data, callback) => {
		if(typeof data.email !== 'string' || typeof data.password !== 'string')
			return callback({ success: false, error: "Please fill in all required fields!" });

		let user = new UserModel({
			Name: data.name,
			Email: data.email,
			Password: data.password,
			Token: randomString()
		});

		user.save((err) => {
			if(err) {
				if(callback) callback({ success: false, error: err.errmsg });
				return;
			}

			let settings = new SettingsModel({ Token: user.Token });
			settings.save(err => {
				if(err) {
					UserModel.findOne({ _id: user._id }).remove();
					if(callback) callback({ success: false, error: err.errmsg });
					return;
				}
				if(callback) callback({ success: true, user: user, settings: settings });
			});
		});
	}
};

const randomString = (len = 32) => {
	const allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let r = '';
	for(let i = 0; i < len; i++) r += allowed[Math.floor(Math.random() * allowed.length)];
	return r;
}

module.exports = User;