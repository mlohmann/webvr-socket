var express     = require('express'),
	app         = express(),
	server      = require('http').createServer(app),
	io          = require('socket.io').listen(server),
	connections = {};

server.listen(3000);

app.get('/', function(req, res){
	res.sendfile(__dirname+'/index.html');
});

app.get('/mobile.html', function(req, res){
	res.sendfile(__dirname+'/mobile.html');
});

app.get('/desktop.html', function(req, res){
	res.sendfile(__dirname+'/desktop.html');
});

app.get('/webVR.html', function(req, res){
	res.sendfile(__dirname+'/webVR.html');
});

app.get('/public/DesktopClient.js', function(req, res){
	res.sendfile(__dirname+'/public/DesktopClient.js');
});

app.get('/public/MobileClient.js', function(req, res){
	res.sendfile(__dirname+'/public/MobileClient.js');
});

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/src', express.static(__dirname + '/src'));

io.sockets.on('connection', function(socket){

	socket.on('create-session', function() {
		var pair = new SocketPairing(socket); 
		socket.pair = pair; 
		socket.controller = false;
		socket.emit('initial-state', {id:pair.id, session: pair.session, paired: pair.connected});

		connections[pair.sessionName] = pair;
	});
	
	socket.on('session-connect', function(data) {
		var pair = connections['s'+data.session];
		socket.controller = true;
		
		if(pair) {
			pair.controller = socket;
			pair.display.emit('connection-established');
			pair.controller.emit('connection-established');
			pair.connected = true;
			socket.pair = pair;
		}
	});

	socket.on('mobile-send', function(data) {
		if(socket.pair && socket.pair.display) socket.pair.display.emit('mobile-receive', data);
	});

	socket.on('desktop-send', function(data) {
		if(socket.pair && socket.pair.controller) socket.pair.controller.emit('desktop-receive', data); 
	});
	
	socket.on('disconnect', function () {
		if(socket.pair) {
			if(socket.controller) {
				clearController(socket.pair);
			} else {
				clearSession(socket.pair);
			}
			socket.pair = null;
		}
	});
});


function getSessionID() {
	var id;

	do{
		id = Math.round(Math.random() * 8999) + 1000;
	} while(connections['s'+id])

	return id;
}

function clearSession(pair) {
	pair.display = null;
	pair.connected = false;

	if(pair.controller) {
		pair.controller.emit('display-disconnected');
		pair.controller.pair = null;
		pair.controller = null;
	}
	
	delete connections[pair.sessionName];
}

function clearController(pair) {
	pair.controller = null;
	pair.connected = false;
	
	if(pair.display) pair.display.emit('controller-disconnected');
}

var SocketPairing = function(socket) {
	var sessionID = getSessionID(),
		p = {
			display: socket,
			connected: false,
			controller: null,
			id: socket.id,
			session: sessionID,
			sessionName: 's'+sessionID
		};

	return p;
}