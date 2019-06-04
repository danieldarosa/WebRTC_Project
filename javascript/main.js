require('./lecteur_HLS');
var config = require('./config');

//Connect to the signaling server
var ws = new WebSocket(config.signaling_server_ip);
var STUN_Server = null;
var myConnexion = new RTCPeerConnection(STUN_Server);
var welcomeMessage = "Hi from : " + config.id;
//TODO : Others Peers connection


console.log("RTC connexion was created");

//Signaling server listeners
ws.onopen = function() {
    console.log("Connected");
    var message = parseToMessage('candidate', welcomeMessage);
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
    //myConnexion.createAnswer(function (answer) {
        //myConnexion.setLocalDescription(answer);
        //sendtosignaling(parseToMessage('answer', answer));
    //});
    console.log("Offer : ", data);
}

function onserver(data) {
    //myConnexion.setRemoteDescription(new RTCSessionDescription(data));
    console.log("Answer : ", data);
}

function oncandidate(data) {
    //myConnexion.onicecandidate(new RTCIceCandidate(data));
    console.log("Candidate : ", data);
}

//Init send offer when user clicks on play button
$("#video").on('play', function() {
    console.log("Entered");
    myConnexion.createOffer(function(offer) {
        myConnexion.setLocalDescription(offer);
        sendtosignaling(parseToMessage('offer', offer));
    });
});