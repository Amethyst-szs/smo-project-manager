console.log(`Starlight Connection Logger`);

// Node.js socket server script
const net = require('net');
var clients = [];

// Create a server object
const server = net.createServer((socket) => {
    console.log('Connection from', socket.remotePort);

    //MAIN FUNCTION HERE
    socket.on('data', (data) => {
        //Special case "Manager" calls from client
        if(data == `ManagerConnected`){
            console.log(`Successful connection to project manager`);
        } 
        else if (data == `ManagerShutdown`){
            server.close();
            server.unref();
            process.exit();
        } else {
            //This is where normal data is echoed / processed
            console.log(data.toString());
        }
    });
})

.on('connection', function (socket) {
    clients.push(socket);
})

.on('error', (err) => {
    console.error(err);
});

server.listen(3080);