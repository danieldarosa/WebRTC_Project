var streamer = require('./lecteur_HLS');
var config = require('./config');

//Connect to the signaling server
var ws = new WebSocket(config.signaling_server_ip);
var myConnexion = new RTCPeerConnection(config.stun_server);
var welcomeMessage = "Hi from : " + config.id;
var stream = null;
var video = document.getElementById('video');
//TODO : Others Peers connection

$("#play-btn").click(function() {
    streamer.getStream();
    console.log("Entered");
    myConnexion.createOffer(function(offer) {
        addStream();
        console.log(offer);
        myConnexion.setLocalDescription(offer);
        sendtosignaling(parseToMessage('offer', offer));
    }, function (err) {
        console.log("ERROR LOG : ",err);
    });
})

console.log("RTC connexion was created");

myConnexion.onicecandidate = function (event) { 
    if (event.candidate) {
        sendtosignaling(parseToMessage("candidate", event.candidate)); 
    } 
 };
 
 myConnexion.onaddstream = function (e) {
     console.log("Hello");
     if(e !== undefined) {
        video.stream = e.stream;
        console.log("Video stream", video.stream); 
     }
 };

//Signaling server listeners
ws.onopen = function() {
    console.log("Connected");
    var message = parseToMessage('LOG', welcomeMessage);
    sendtosignaling(message);
}

ws.onclose = function() {
    console.log("Disconnected");
}

ws.onerror= function(err) {
    console.log("Error : ", err);
}

ws.onmessage= function(message) {
    var payload = JSON.parse(message.data);
    switch(payload.type) {
        case "offer":
            onoffer(payload);
            break;
        case "answer":
            onanswer(payload);
            break;
        case "candidate":
            oncandidate(payload);
            break;
        default:
            console.log("ERROR : Message not valid");
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

function onoffer(payload) {
    console.log("Offer : ", payload);
    myConnexion.setRemoteDescription(payload.data);
    myConnexion.createAnswer(function (answer) {
        myConnexion.setLocalDescription(answer);
        sendtosignaling(parseToMessage('answer', answer));
    }, function (err) {
        console.log(err);
    });
}

function onanswer(payload) {
    console.log("Answer : ", payload);
    myConnexion.setRemoteDescription(new RTCSessionDescription(payload.data));
}

function oncandidate(payload) {
    console.log("Candidate : ", payload);
    myConnexion.addIceCandidate(new RTCIceCandidate(payload.data));
}

function addStream () {
    stream =  new MediaStream(video.captureStream());
    myConnexion.addStream(stream);
    //myConnexion.addTrack(videotracks);
    //myConnexion.addTrack(audiotracks);
}