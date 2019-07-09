/*
Author : Daniel Da Rosa
Project : WebRTC Demo
File : config.js
Version : 1.0
*/


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

exports.signaling_server_ip = 'ws://192.168.1.130:9090'
exports.stun_server = { 
    "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
 }
