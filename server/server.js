const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 9090,
    clientTracking: true
});

let master = {
    id: null,
    conn: null,
}

//Client['892849075'] = client
let clients = {};
var nbPeers = 0; 

console.log("[SERVER LOG]Server is running...");

wss.on('connection', function connection(ws) {
    
    ws.on('message', function incoming(message) {
    
        const json_message = JSON.parse(message);
        //message['data']['clients'] = wss.clients;
        console.log('[SERVER LOG]received:', message);
        switch(json_message.type) {
            case 'arrival':
                onArrival(json_message, ws);
                break;
            case 'offer':
                onOffer(json_message);
                break;
            case 'answer':
                onAnswer(json_message);
                break;
            case 'candidate':
                onCandidate(json_message);
                break;
            case 'disconnect':
                onDisconnect(json_message);
                break;
            case 'info':
                onInfo(json_message.id);
                break;
            default:
                console.log("ERROR : Message cannot be parsed");
        }
        // wss.clients.forEach(function each(client) {
        //     if (client !== ws && client.readyState === WebSocket.OPEN) {
        //         client.send(message);
        //     }
        // });
    });

});


function hasMaster() {
    return master.id !== null;
}

function isMaster(id) {
    return master.id === id;
}

function changeMaster() {
    //If master assign a new one
    if(clients !== null) {
        const client = getNextClient();
        master.id = client.key;
        master.conn = client.conn;
        console.log("Master changed, now master is : ", master.id);
        console.log("List of clients : ", getClients());
    }
}

function updateClients(id, conn) {
    clients[id] = conn;
    console.log("Client added : ", id);
    console.log("List of clients : ", getClients());
    nbPeers++;
    console.log("Number of peers : ", nbPeers);
}

function onArrival(message, conn) {
    updateClients(message.id, conn);
    if(!hasMaster()) {
        master.id = message.id;
        master.conn = conn;
        console.log("Master is now : ", master.id);
    } else {
        console.log("IS NOT A MASTER");
        //send initOffer to master
        //Problem here, when a third peer tries to come, it ignores that line
        master.conn.send(parseToMessage('init_offer', {}, message.id))
        console.log("SENT INIT_OFFER TO MASTER");
        //send to the client the masterid parseToMessage('master_id', {}, master.id))
        clients[message.id].send(parseToMessage('master_id', {}, master.id));
        //sent to the client his id
        clients[message.id].send(parseToMessage('client_id', {}, message.id));
    }
}

function onOffer(message) {
    console.log('OFFER : ', message);
    if(userExists(message.dst)) {
        clients[message.dst].send(parseToMessage('offer', message.data, message.id));
    } 
}

function onAnswer(message) {
    console.log('ANSWER : ', message);
    if (userExists(message.dst)) {
        clients[message.dst].send(parseToMessage('answer', message.data, message.id));
    }
}

function onCandidate(message) {
    console.log("GETS IN HERE");
    console.log(message)
    //Send the candidate message to the client that asked the offer
    clients[message.dst].send(parseToMessage('candidate', message.data, message.id));
}

function onDisconnect(message) {
    //Check if it's master
    if (userExists(message.id)) {
        delete clients[message.id];
        if(isMaster(message.id)) {
            changeMaster();
        }
        //Delete from client
        console.log(message.id);
    }
}

function parseToMessage(type, data, src) {
    return JSON.stringify({
        "type" : type,
        "data" : data,
        "src": src
    })
}

function userExists(id) {
    for(var key in clients) {
        if(key === id) {
            return true;
        }
    }
    return false;
}

function getClients() {
    let keys = [];

    for(var key in clients) {
        keys.push(key);
    }

    return keys;
}

function getNextClient() {
    for (let key in clients) {
        return  {
            //id
            key: key,
            conn: clients[key]
    }
}}

function onInfo(id) {
    data = {
        master: master.key,
        clients: getClients()
    }
    master.conn.send(parseToMessage('info', data, id));
    for (let key in clients) {
        clients[key].send(parseToMessage('info', data, id));
    }
}