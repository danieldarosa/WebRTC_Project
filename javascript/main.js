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
    var message = parseToMessage('candidate', 'Hi from Daniel');
    sendtosignaling(message);
}

ws.onclose = function() {
    console.log("Disconnected");
}

ws.onerror= function(err) {
    console.log("Error : ", err);
}

ws.onmessage= function(message) {
    var data = JSON.parse(message.data);
    switch(data.type) {
        case "offer":
            onoffer(data);
            break;
        case "answer":
            onserver(data);
            break;
        case "candidate":
            oncandidate(data);
            break;
        default:
            config.log("ERROR : Message not valid");
            break;
    }
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

//Handle response from signaling server

function onoffer(data) {
    console.log("Offer : ", data);
}

function onserver(data) {
    console.log("Answer : ", data);
}

function oncandidate(data) {
    console.log("Candidate : ", data);
}