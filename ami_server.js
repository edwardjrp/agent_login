var io = require("socket.io-client");

var socket;
console.log("Connecting to");

socket = io.connect("http://localhost:8880");

var AsteriskAmi = require('asterisk-ami');
var ami = new AsteriskAmi( { host: '10.5.5.10', username: 'test', password: 'secret5' });

        socket.on('connect', function(){
               // socket.send({cedula: "A999"});

ami.on('ami_data', function(data){
//console.log(data);

    if (data.event == 'Newstate' && data.channelstate == '6' && data.channel.split("/")[0] == 'Agent' ){
    console.log("ami DATA ===> ", data);

        var agente = data.channel.split("/")[1];
        var cliente = data.calleridnum;
        console.log("soy el agente ==>",agente);
        socket.emit("aster", {agente: agente, cliente: cliente});
    }
    agente= null;
    cliente=null;
});

ami.connect(function(){
    ami.send({action: 'Ping'});//run a callback event when we have connected to the socket
});//connect creates a socket connection and sends the login action

ami.send({action: 'Ping'});

}); //close connect
