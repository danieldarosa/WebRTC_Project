require('./lecteur_HLS');
var config = require('./config');

//Connect to the signaling server
var ws = new WebSocket('ws://localhost:9090');
var STUN_Server = null;
newConnexion = new RTCPeerConnection(STUN_Server);

console.log("RTC connexion was created");

//Signaling server listeners
ws.onopen = function() {
    console.log("Connected");
    var message = parseToMessage('ping', 'Hi from Daniel');
    sendtosignaling(message);
}

ws.onclose = function() {
    console.log("Disconnected");
}

ws.onerror= function(err) {
    console.log("Error : ", err);
}

ws.onmessage= function(message) {
    console.log("Message recieved :", message);
}

//Sending message to signaling server
function sendtosignaling(message) {
    ws.send(JSON.stringify(message));
}

function parseToMessage(type, data) {
    
    return {
        "type" : type,
        "data" : data,
        "id" : config.id
    }
}