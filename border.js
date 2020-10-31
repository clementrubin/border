var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
// set the view engine to ejs and the path to views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'))

// border sockets treatment
var sock = require('./server_scripts/socket_functions');
io.on('connection', function (socket) { sock.main_socket(socket) });

// routes const
const borderRoutes = require('./routes');
app.use('/', borderRoutes);

server.listen(6969);
