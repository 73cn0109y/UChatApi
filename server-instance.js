/**
 * Created by texpe on 12/01/2017.
 */

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const UserModel = require('./dist/models/user');
const SocketServer = require('./dist/chat/websocket');

class Server {
	constructor(options) {
		this.options = options;
		this.app = express();

		this.initDB();
		this.initEngine();
		this.initRoutes();
		this.finalInit();
	}

	initDB() {
		this.session = session({
			secret: 'kUREZObuXezHJftDJkJOj2rjkUEgvrYe',
			resave: false,
			saveUninitialized: false,
			store: new mongoStore({ mongooseConnection: mongoose.connection })
		});

		mongoose.Promise = global.Promise;
		mongoose.connect(this.options.mongoURL, err => {
			if(err) console.error(err.name + ': ' + err.message);
		});

		this.app.use(this.session);
	}

	initEngine() {
		this.app.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }));

		this.app.set('view engine', 'ejs');
		this.app.engine('ejs', require('ejs').renderFile);
		this.app.set('layout', 'layouts/default');
		this.app.use(require('express-ejs-layouts'));

		this.app.enable('view cache');
	}

	initRoutes() {
		this.app.all('*', (req, res, next) => {
			if(req.headers['x-forwarded-proto'] === 'http') return res.redirect('https://' + req.headers.host + req.path);
			next();
		});

		this.app.use('/css', express.static('./public/css'));
		this.app.use('/js', express.static('./public/js'));
		this.app.use('/api', require('./dist/api'));

		// Root website
		this.app.get('/', (req, res) => {
			if(req.session.user) {
				UserModel.findOne({ Email: req.session.user.Email }, (err, user) => {
					if(err || !user) user = null;
					res.render('home', { user: user });
				});
			}
			else res.render('index', { user: null });
		});

		this.app.use((err, req, res, next) => {
			console.error(err.stack);
			res.status(500).send('Something bad happened!');
		});
	}

	finalInit() {
		let server = this.app.listen(this.options.port, this.options.ip, () => {
			console.log(`Server is listening on ${this.options.ip}:${this.options.port}...`);
		});

		this.socketServer = new SocketServer(server);
	}
}

module.exports = Server;