var request = require('request');
var parseString = require('xml2js').parseString;
var config = require('./config');

var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

function makePostRequest(postBody, url){
	return new Promise(function(resolve, reject){
		request.post({
			url:'http://' + config.MODEM_IP + url, 
			body: postBody,
			headers: {
				'Accept': '*/*',
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'en-US,en;q=0.5',
				'Cache-Control': 'no-cache',
				'Connection':'keep-alive',
				'Content-Length': postBody.length,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Host': config.MODEM_IP,
				'Pragma': 'no-cache',
				'Referer': 'http://' + config.MODEM_IP + '/html/home.html',
				'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0',
				'X-Requested-With': 'XMLHttpRequest'
			}
		},
		function optionalCallback(err, httpResponse, body) {
		  if (err) {
		    return reject(err);
		  }else{
		  	return resolve(body);
		  }
		});
	});
}

function makeGetRequest(url){
	return new Promise(function(resolve, reject){
		request.get({
			url:'http://' + config.MODEM_IP + url,
			headers: {
				'Accept': '*/*',
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'en-US,en;q=0.5',
				'Cache-Control': 'no-cache',
				'Connection':'keep-alive',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Host': config.MODEM_IP,
				'Pragma': 'no-cache',
				'Referer': 'http://' + config.MODEM_IP + '/html/home.html',
				'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0',
				'X-Requested-With': 'XMLHttpRequest'
			}
		},
		function optionalCallback(err, httpResponse, body) {
		  if (err) {
		    return reject(err);
		  }else{
		  	return resolve(body);
		  }
		});
	});
}

function parseXML(xml){
	return new Promise(function(resolve, reject){
		parseString(xml, function (err, result){
			if(err)
				reject(err);
			else
				resolve(result);
		});
	});
}

function checkLoginSuccess(data){
	return new Promise(function(resolve, reject){
		if(data.response && data.response == 'OK')
			resolve('Login successful');
		else
			reject('Could not login');
	});
}

function loginAsAdmin(){
	var postBody = '<?xml version="1.0" encoding="UTF-8"?><request><Username>' + config.MODEM_USER + '</Username><Password>' + Base64.encode(config.MODEM_USER) + '</Password></request>';
	var url = '/api/user/login';
	return makePostRequest(postBody, url)
	.then(function(data){
		return parseXML(data);
	})
	.then(function(data){
		return checkLoginSuccess(data);
	})
}

function checkLoginStatus(res){
	return new Promise(function(resolve, reject){
		if(res.response.State == -1)
			reject('Not logged in');
		else
			resolve('Already logged in');
	});
}

function deleteSMS(id){
	return new Promise(function(resolve, reject){
		var body = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><request><Index>' + id + '</Index></request>';
		var url = '/api/sms/delete-sms';
		makePostRequest(body, url)
		.then(function(data){
			return parseXML(data);
		})
		.then(function(data){
			if(data.response && data.response == 'OK'){
				return resolve('Deleted');
			}else{
				return reject('Message could not be deleted');
			}
		})
		.catch(function(err){
			return reject('Message could not be deleted ' + err);
		})
	});
}

exports.checkLogin = function(){
	var url = '/api/user/state-login';
	return makeGetRequest(url)
	.then(function(data){
		return parseXML(data);
	})
	.then(function(data){
		return checkLoginStatus(data);
	})
	.catch(function(){
		return loginAsAdmin();
	})
}

exports.readSMS = function(pageNo){
	return new Promise(function(resolve, reject){
		var body = '<?xml version="1.0" encoding="UTF-8"?><request><PageIndex>' + pageNo +'</PageIndex><ReadCount>50</ReadCount><BoxType>1</BoxType><SortType>0</SortType><Ascending>0</Ascending><UnreadPreferred>0</UnreadPreferred></request>';
		var url = '/api/sms/sms-list';
		makePostRequest(body, url)
		.then(function(data){
			return parseXML(data);
		})
		.then(function(data){
			if(data.response.Count != 0){
				return resolve(data);
			}else{
				return reject('No sms on this page');
			}
		})
	});
}

exports.checkAvailability = function(){
	return new Promise(function(resolve, reject){
		makeGetRequest('http://'+ config.MODEM_IP +'/html/home.html')
		.then(function(){
			return resolve('Modem Available');
		})
		.catch(function(){
			return reject('Could not connect to modem\'s IP address');
		})
	});
}