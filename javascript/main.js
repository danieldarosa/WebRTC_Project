var streamer = require('./lecteur_HLS');
var config = require('./config');
var unload = require('unload');

unload.add(function () {
    alert('Working');
})

//Connect to the signaling server
var ws = new WebSocket(config.signaling_server_ip);
var myConnexion = new RTCPeerConnection(config.stun_server);
var remoteConnexion = new RTCPeerConnection(config.stun_server);
var welcomeMessage = "Hi from : " + config.id;
var stream = null;
var video = document.getElementById('video');
var peers = [];
var client = [];
var sendChannel;
var recieveChannel;

$("#play-btn").click(function () {
    console.log("Entered");
})

$("#disconnect-btn").click(function () {
    sendtosignaling(parseToMessage('disconnect', {}));
})

$("#update-btn").click(function () {
    updateTable();
})

console.log("RTC connexion was created");

myConnexion.onicecandidate = function (event) {
    for(let peer of peers) {
        console.log("ON ICE CANDIDATE : ", event);
        if (event.candidate) {
            console.log("EVENT CANDIDATE OK");
            sendtosignaling(parseToMessage('candidate', event.candidate, peer));
        }
    }
    
};

//Channel to send data (not working ffs)
myConnexion.ondatachannel = function(event) {
    console.log('Data channel is created!');
    event.channel.onopen = function() {
      console.log('Data channel is open and ready to be used.');
    };
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
        case "client_id":
            onClientId(payload);
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
        case "disconnect":
            ondisconnect();
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

function onClientId(payload) {
    var client_id = payload.src;
    console.log(client_id);
    client.push(client_id);
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
    console.log("GOES HERE");
    console.log("Candidate : ", payload);
    var ice = myConnexion.addIceCandidate(new RTCIceCandidate(payload.data));
    console.log(ice);
    console.log(payload.src);
    client.push(payload.src);
}

function ondisconnect() {
    console.log("Disconnect function entrered");
    myConnexion.close();
    myConnexion.onicecandidate = null;
    myConnexion.onaddstream = null;
}


function addStream() {
    stream = new MediaStream(video.captureStream());
    myConnexion.addStream(stream);
    //myConnexion.addTrack(videotracks);
    //myConnexion.addTrack(audiotracks);
}

function updateTable() {
    var table = document.getElementById("table table-striped");
    var row1 = table.insertRow(0);
    var row2 = table.insertRow(1);
    row2.style.color = 'blue';
    var row3 = table.insertRow(2);
    var nbTotal = 0;

    //Title cells
    var cell_row_01 = row1.insertCell(0);
    var cell_row_02 = row1.insertCell(1);
    var cell_row_03 = row1.insertCell(2);
    cell_row_01.innerHTML = "#";
    cell_row_02.innerHTML = "ID";
    cell_row_03.innerHTML = "Connexion status";
    
    
    //Master cell
    var cell_row_11 = row2.insertCell(0);
    var cell_row_12 = row2.insertCell(1);
    var cell_row_13 = row2.insertCell(2);
    cell_row_11.innerHTML = nbTotal;
    if (peers[0] == null) {
        cell_row_12.innerHTML = "You are the master !"
    } else {
        cell_row_12.innerHTML = peers[0];
    }
    cell_row_13.innerHTML = "Connected";
    nbTotal++;

    //Client cell
    if(client[0] !== null) {
        console.log("GOES IN HEERERERR")
        var cell_row_21 = row3.insertCell(0);
        var cell_row_22 = row3.insertCell(1);
        var cell_row_23 = row3.insertCell(2);
        cell_row_21.innerHTML = nbTotal;
        cell_row_22.innerHTML = client[0];
        console.log(client[0]);
        cell_row_23.innerHTML = "Connected";
        nbTotal++;
    }
    

    document.getElementById("lead").innerHTML = "Number of peers : " + nbTotal;
}   