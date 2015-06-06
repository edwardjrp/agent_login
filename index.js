var cliente = '';
var agente = '';
var agentesConectados = {};    //listado de agentes conectados
var conexiones ={};
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs')

    app.listen(8880);

    function handler(req, res){
        fs.readFile(__dirname + '/index.html',
        function(err, data){
            if (err){
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
    }


io.sockets.on('connection', function(socket){
    socket.on("identificacion", function(agentid){
        agentesConectados[agentid.cedula] = socket.id;
        console.log("In connect ==> ",Object.keys(agentesConectados).length);
    });

    socket.on("aster", function(data){
        console.log("data recibida por aster =>  ",data);
        var llamada = data.cliente;
       io.sockets.socket(agentesConectados[data.agente]).emit('bridge',llamada);

    });

  socket.on('disconnect', function(agenteid) {
   // socket.on("close", function(agentid){
    
    console.log(agenteid);
    console.log("Cantidad ===> ",Object.keys(socket.manager.open).length);
    console.log("Cerrados ===> ",Object.keys(socket.manager.closed).length);
    
    console.log("Desconectando ===> ",socket.id);
    console.log(Object.keys(agentesConectados).length);
    delete agentesConectados[agenteid];
    
    //socket.id.disconnect();
    console.log("After Disconnect ==> ",Object.keys(agentesConectados).length);
    
       // agentesConectados[agentid.cedula] = socket.id;
       // conexiones[socket.id]
   // });

  });
  
});
/*
process.on('uncaughtException', function(err) {
 process.exit(1);
 return console.log(err.stack);
});
*/