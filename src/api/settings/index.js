/**
 * Created by texpe on 16/01/2017.
 */

const router = require('express').Router();
const SettingsModel = require('../../models/settings');

router.get('/settings', (req, res, next) => {
	if(!req.query.token || req.query.token == 'null') return res.status(400).json({ success: false }).end();

	SettingsModel.findOne({ Token: req.query.token }, '-_id -Token', (err, settings) => {
		if(err) return res.status(400).json({ success: false }).end();
		if(!settings) {
			settings = new SettingsModel({ Token: req.query.token });
			settings.save(err => {
				if(err) return res.status(400).json({ success: false }).end();
				res.json({ success: true, settings: settings }).end();
			});
			return;
		}
		res.json({ success: true, settings: settings }).end();
	});
});

router.put('/settings', (req, res, next) => {
	if(!req.query.token || req.query.token == 'null') return res.status(400).json({ success: false }).end();

	SettingsModel.findOneAndUpdate({ Token: req.query.token }, { $set: req.body }, {
		new: true,
		upsert: true
	}, (err, settings) => {
		if(!settings) {
			settings = new SettingsModel(req.body);
			settings.Token = req.query.token;
			settings.save(err => {
				if(err) return res.status(400).json({ success: false }).end();
				res.json({ success: true, settings: settings }).end();
			});
			return;
		}
		else settings = settings.toObject();

		if(err) return res.status(400).json({ success: false }).end();
		res.json({ success: true, settings: settings }).end();
	});
});

module.exports = router;