var crypto = require('crypto');
//Media server info
var SERVERADDRESS = 'http://129.194.185.47';
var SERVERPORT = ':6106';
var SERVERLIVE = '/live_labo_smg/test1/playlist.m3u8';

exports.media_server_address = SERVERADDRESS + SERVERPORT + SERVERLIVE;

//Creating crypto id
var current_date = (new Date()).valueOf().toString();
var random = Math.random().toString();
exports.id = crypto.createHash('sha256').update(current_date + random).digest('hex');
