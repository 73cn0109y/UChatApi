'use strict';

/**
 * Created by texpe on 20/11/2016.
 */

var router = require('express').Router();
var User = require('../user');
var UserModel = require('../../models/user');

router.post('/login', function (req, res, next) {
	if (req.session && req.session.user) return res.json({ success: true, user: req.session.user }).end();
	var isApi = typeof req.body.api === 'undefined';
	if (req.body.type === 'register') {
		User.register(req.body, function (result, status) {
			if (result.success) {
				req.session.regenerate(function () {
					req.session.user = {
						_id: result.user._id,
						Name: result.user.Name,
						Email: result.user.Email,
						Created: result.user.Created,
						Services: result.user.Services,
						Token: result.user.Token
					};
					req.session.success = "Authenticated as " + result.user.Name;
					if (isApi) res.json({ success: true, user: req.session.user }).end();else res.redirect('/');
				});
			} else res.json(result).end();
		});
	} else {
		User.login(req.body, function (result, status) {
			if (typeof status !== 'undefined') res.status(status).end();
			if (result.success) {
				req.session.regenerate(function () {
					req.session.user = {
						_id: result.user._id,
						Name: result.user.Name,
						Email: result.user.Email,
						Created: result.user.Created,
						Services: result.user.Services,
						Token: result.user.Token
					};
					req.session.success = "Authenticated as " + result.user.Name;
					if (isApi) res.json({ success: true, user: req.session.user }).end();else res.redirect('/');
				});
			} else res.json(result).end();
		});
	}
});

router.post('/token', function (req, res, next) {
	if (!req.body.Token) return res.json({ success: false }).end();

	UserModel.findOne({ Token: req.body.Token }, function (err, user) {
		if (err) return res.status(500).json({ success: false }).end();
		res.json({ success: true, user: user || {} }).end();
	});
});

router.all('/login', function (req, res, next) {
	res.redirect('back');
});

router.all('/logout', function (req, res, next) {
	req.session.destroy(function (err) {
		return res.redirect('/');
	});
});

router.all('*', function (req, res, next) {
	if (!req.session || !req.session.user) {
		if (req.originalUrl.startsWith('/api/settings') && req.query.token) return next();
		if (req.originalUrl.startsWith('/api/bot') && req.body.token) return next();
		if (req.originalUrl.startsWith('/api')) return res.json({ success: false, error: "UNAUTHORIZED" }).end();else return res.redirect('/');
	}
	next();
});

module.exports = router;