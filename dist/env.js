'use strict';

/**
 * Created by texpe on 16/12/2016.
 */

var serverURL = process.env.OPENSHIFT_GEAR_DNS ? 'https://' + process.env.OPENSHIFT_GEAR_DNS : 'http://localhost:8080';

module.exports = {
	services: {
		youtube: {
			ClientId: '444265651543-271flhbj2vt55r7d1g73kilu1ju2joeh.apps.googleusercontent.com',
			ClientSecret: 'pbRpoT61olGjeRO7QYzsFQgf',
			RedirectURL: serverURL + '/api/services/authorize/youtube',
			LoginURL: 'https://accounts.google.com/o/oauth2/auth',
			AuthorizeURL: 'https://accounts.google.com/o/oauth2/token',
			Scopes: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl',
			apiBaseURL: 'https://www.googleapis.com/youtube/v3/'
		},
		liveedu: {
			ClientId: 'LEiSDVATYINjUp8MMtamP1Wv3jNyKCEB9bRXKmsV',
			ClientSecret: 'uqP6mVIDVN5kAC4h3k4mPBpftlLtkax7gFBTw88vMZKMlsfOzylWDpsesBp2oeIr54mDIkqG432YtUqiJdf48sowzzCJKx2NiRA8UHVkMqKQFla1JOg8QGXkyv2V65e0',
			RedirectURL: serverURL + '/api/services/authorize/liveedu',
			LoginURL: 'https://www.liveedu.tv/o/authorize',
			AuthorizeURL: 'https://www.liveedu.tv/o/token/',
			Scopes: 'read chat',
			apiBaseURL: 'https://www.liveedu.tv:443/api'
		},
		twitch: {
			ClientId: 'b4jtt27po2tch5l8txopvnvqondbsf',
			ClientSecret: 'jxkrxhh5er8sajp6hykzog0xofy2j4',
			RedirectURL: serverURL + '/api/services/authorize/twitch',
			LoginURL: 'https://api.twitch.tv/kraken/oauth2/authorize',
			AuthorizeURL: 'https://api.twitch.tv/kraken/oauth2/token',
			Scopes: 'user_read chat_login',
			apiBaseURL: 'https://api.twitch.tv/kraken'
		},
		beam: {
			ClientId: '33ff380ac13d35bf4193225d34655521593c82d21e06b139',
			ClientSecret: '77df83a4b36e36566cd29ef15e34121b7a37648051dfb722e7d46d5a637be3be',
			RedirectURL: serverURL + '/api/services/authorize/beam',
			LoginURL: 'https://beam.pro/oauth/authorize',
			AuthorizeURL: 'https://beam.pro/api/v1/oauth/token',
			Scopes: 'chat:bypass_links chat:bypass_slowchat chat:chat chat:connect chat:view_deleted chat:whisper user:details:self',
			apiBaseURL: 'https://beam.pro/api/v1'
		}
	}
};