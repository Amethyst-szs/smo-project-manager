//Requirements
const fs = require('fs-extra');

function ServerCommuncation(Transit){
    const net = require('net');
    var os = require( 'os' );

    var networkInterfaces = os.networkInterfaces();
    console.log(networkInterfaces);
    var ip = networkInterfaces.Ethernet[0].address;

    console.log(ip);

    const client = new net.Socket();
    client.connect({ port: 3080 }, ip, () => {
        client.write(Transit);
        client.end();
        client.destroy();
    });
}

module.exports = {
    CreateStarlight: function(WorkingDirectory, OwnDirectory){
        fs.mkdirSync(`${WorkingDirectory}/starlight/`);
        fs.copySync(`${OwnDirectory}/starlight_base/`, `${WorkingDirectory}/starlight/`);
        fs.copySync(`${OwnDirectory}/starlight_base_project/`, `${WorkingDirectory}/project/`);
    },

    LoggerInit: function(OwnDirectory){
        ServerCommuncation(`ManagerConnected`);
    },

    Shutdown: function(OwnDirectory){
        ServerCommuncation(`ManagerShutdown`);
    },
}