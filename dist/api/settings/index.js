'use strict';

/**
 * Created by texpe on 16/01/2017.
 */

var router = require('express').Router();
var SettingsModel = require('../../models/settings');

router.get('/settings', function (req, res, next) {
	if (!req.query.token || req.query.token == 'null') return res.status(400).json({ success: false }).end();

	SettingsModel.findOne({ Token: req.query.token }, '-_id -Token', function (err, settings) {
		if (err) return res.status(400).json({ success: false }).end();
		if (!settings) {
			settings = new SettingsModel({ Token: req.query.token });
			settings.save(function (err) {
				if (err) return res.status(400).json({ success: false }).end();
				res.json({ success: true, settings: settings }).end();
			});
			return;
		}
		res.json({ success: true, settings: settings }).end();
	});
});

router.put('/settings', function (req, res, next) {
	if (!req.query.token || req.query.token == 'null') return res.status(400).json({ success: false }).end();

	SettingsModel.findOneAndUpdate({ Token: req.query.token }, { $set: req.body }, {
		new: true,
		upsert: true
	}, function (err, settings) {
		settings = settings.toObject();
		delete settings._id;
		delete settings.Token;
		if (err) return res.status(400).json({ success: false }).end();
		res.json({ success: true, settings: settings }).end();
	});
});

module.exports = router;