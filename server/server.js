const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 9090,
});
console.log("[SERVER LOG]Server is running...");

wss.on('connection', function connection(ws) {
    
    ws.on('message', function incoming(message) {
    
        //message['data']['clients'] = wss.clients;
        console.log('[SERVER LOG]received:', message);

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

});