var streamer = require('./lecteur_HLS');
var config = require('./config');
var unload = require('unload');

unload.add(function () {
    alert('Working');
})

//Connect to the signaling server
var ws = new WebSocket(config.signaling_server_ip);
var myConnexion = new RTCPeerConnection(config.stun_server);
var welcomeMessage = "Hi from : " + config.id;
var stream = null;
var video = document.getElementById('video');
var peers = [];

$("#play-btn").click(function () {
    console.log("Entered");
})

console.log("RTC connexion was created");

myConnexion.onicecandidate = function (event) {
    for(let peer in peers) {
        console.log("ON ICE CANDIDATE : ", event);
        if (event.candidate) {
            console.log("EVENT CANDIDATE OK");
            sendtosignaling(parseToMessage('candidate', event.candidate, peer));
        }
    }
    
};

myConnexion.onaddstream = function (e) {
    console.log("Hello");
    if (e !== undefined) {
        video.stream = e.stream;
        console.log("Video stream", video.stream);
    }
};

//Signaling server listeners
ws.onopen = function () {
    console.log("Connected");
    //log into websocket
    sendtosignaling(parseToMessage('arrival', {}));
}

ws.onclose = function () {
    console.log("Disconnected");
}

ws.onerror = function (err) {
    console.log("Error : ", err);
}

ws.onmessage = function (message) {
    var payload = JSON.parse(message.data);
    switch (payload.type) {
        //case master_id
        case "master_id":
            onMasterId(payload);
            break;
        case "init_offer":
            onInitOffer(payload);
            break;
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

function parseToMessage(type, data, dst) {

    return {
        "type": type,
        "data": data,
        "id": config.id,
        "dst": dst
    }
}

//Handle response from signaling server

function onMasterId(payload) {
    var master = payload.src
    peers.push(master);
}

function onInitOffer(payload) {
    //FIXME check if already playing
    var stream = streamer.getStream();
    console.log(stream);
    myConnexion.createDataChannel("test");
    myConnexion.onnegotiationneeded = function () {
        addStream();
        console.log('INIT_OFFER : ', payload);
        myConnexion.createOffer(function (offer) {
            myConnexion.setLocalDescription(offer);
            sendtosignaling(parseToMessage('offer', offer, payload.src));
        }, function (err) {
            console.log("ERROR : ", err);
        })
    }
}

function onoffer(payload) {
    console.log("Offer : ", payload);
    myConnexion.setRemoteDescription(payload.data);
    myConnexion.createAnswer(function (answer) {
        myConnexion.setLocalDescription(answer);
        sendtosignaling(parseToMessage('answer', answer, payload.src));
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
    var cul = myConnexion.addIceCandidate(new RTCIceCandidate(payload.data));
    console.log(cul);
}

function addStream() {
    stream = new MediaStream(video.captureStream());
    myConnexion.addStream(stream);
    //myConnexion.addTrack(videotracks);
    //myConnexion.addTrack(audiotracks);
}