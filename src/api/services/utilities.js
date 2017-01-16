/**
 * Created by texpe on 17/12/2016.
 */

class Utilities {
	static generateState(l=32) {
		const allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let r = '';
		for(let i=0;i<l;i++)r+=allowed[Math.floor(Math.random()*allowed.length)];
		return r;
	}
}

module.exports = Utilities;