/**
 * Created by texpe on 12/01/2017.
 */
'use strict';

const cluster = require('cluster');

const ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
const port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
let mongoURL = (process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://127.0.0.1:27017/') + 'uchat';
const clusterCount = (process.env.NODE_ENV === 'production' ? 4 : 1);

if(cluster.isMaster) {
	for(let i = 0; i < clusterCount; i++) {
		console.log('Spawning child cluster', i);
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log('Worker ' + worker.process.pid + ' died! Respawning...');
		cluster.fork();
	});
} else {
	const server = require('./server-instance');

	new server({
		ip,
		port,
		mongoURL
	});
}