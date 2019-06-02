require('./lecteur_HLS');

//Connect to the signaling server
var ws = new WebSocket('ws://localhost:9090');
var STUN_Server = null;
newConnexion = new RTCPeerConnection(STUN_Server);

console.log("RTC connexion was created");

//Signaling server listeners
ws.onopen = function() {
    console.log("Connected");
}

ws.onclose = function() {
    console.log("Disconnected");
}

ws.onerror= function(err) {
    console.log("Error : ", err);
}