var ent = require('ent');
var border = require('./border_functions');

var max_timer = 20;

var main_socket = function (socket) {
    var addedUser = false;

    // On hard code le temps max à 10 secondes (à change dans la boucle for de "new turn" pour modifier)
    function sendTimer(room_name, t) {
        setTimeout(function() {
            socket.emit('time', {room_name: room_name, t: max_timer-t});
            socket.broadcast.emit('time', {room_name: room_name, t: max_timer-t});
        }, t * 1500, t);
    }

    // when the client emits a new message
    socket.on('new message', function (message) {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: ent.encode(message)
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('new user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = ent.encode(username);
        addedUser = true;
        socket.emit('login');
        // echo globally (all clients) that a person has connected
        // socket.broadcast.emit('user joined', socket.username);
    });

    // Whenever the player asks for creating a room
    socket.on('create_room', function(room_name) {
        room_name = ent.encode(room_name);
        if (border.createRoom(room_name, socket.username)) {
            socket.emit('room_ready', room_name);
        }
    });

    // Whenever the player asks for joining a room
    socket.on('join_room', function(room_name) {
        room_name = ent.encode(room_name);
        if (border.joinRoom(room_name, socket.username)) {
            socket.emit('room_ready', room_name);
        }
    });

    // When a new room of border is joined, the palyers list need to be updated
    socket.on('ask_rooms_update', function() {
        var rooms_list = border.getRooms();
        socket.emit('update_rooms_list', rooms_list);
    });

    // When a new room of border is joined, the palyers list need to be updated
    socket.on('ask_players_update', function(room_name) {
        var players_list = border.getPlayers(room_name);
        socket.emit('update_players_list', {room_name: room_name, players_list: players_list});
        socket.broadcast.emit('update_players_list', {room_name: room_name, players_list: players_list});
    });

    // Whenever the player launchs the game in his room
    socket.on('launch_game', function(room_name) {
        border.launchGame(room_name);
        socket.emit('game_launched', room_name);
        socket.broadcast.emit('game_launched', room_name);
        // Launche the first turn
        /*
        var card = border.drawOneQuestionCard(room_name);
        var players_list = border.getPlayers(room_name);
        var master_name = players_list[Math.floor(Math.random() * players_list.length)];
        socket.emit('new_turn', {room_name: room_name, card: card, master_name: master_name });
        socket.broadcast.emit('new_turn', {room_name: room_name, card: card, master_name: master_name });
        */
    });

    // Whenever a player ask for an answer card
    socket.on('ask_for_card', function(data) {
        var card = border.drawOneAnswerCard(data.room_name);
        if (card != false) {
            socket.emit('new_card', {card: card, index: data.index });
        } else {
            socket.emit('end_game', data.room_name);
            socket.broadcast.emit('end_game', data.room_name);
        }
    });

    // Whenever a new turn begins
    socket.on('new_turn', function(data) {
        var room_name = data.room_name;
        // Choose the master if he is not set
        if (data.name == "" || data.name == undefined || data.name == null) {
            var players_list = border.getPlayers(room_name);
            var master_name = players_list[Math.floor(Math.random() * players_list.length)];
        } else {
            master_name = data.name;
        }
        // Choose the question card
        var card = border.drawOneQuestionCard(room_name);
        if (card != false) {
            socket.emit('new_turn', {room_name: room_name, card: card, master_name: master_name });
            socket.broadcast.emit('new_turn', {room_name: room_name, card: card, master_name: master_name });
            // Timer is up (ATTENTION EN MODIFIANT LES VALEURS)
            for (var t=0 ; t < max_timer ; t++) {
                sendTimer(room_name, t);
            }
            setTimeout(function () {
                socket.emit('time', {room_name: room_name, t: 0});
                socket.broadcast.emit('time', {room_name: room_name, t: 0});
            }, max_timer * 1500);
        } else {
            socket.emit('end_game', data.room_name);
            socket.broadcast.emit('end_game', data.room_name);
        }
    });

    // Whenever a player gives an answer
    socket.on('select_answer', function(data) {
        socket.broadcast.emit('new_answer', {card: data.card, value: data.value, username:data.username });
    });

    // Whenever a user wants to leave a room (NOT USE CURRENTLY)
    socket.on('leave_room', function(room_name) {
        border.leaveRoom(room_name, socket.username);
        var players_list = border.getPlayers(room_name);
        socket.broadcast.emit('update_players_list', {room_name: room_name, players_list: players_list});
    });

    // when the user disconnects
    socket.on('disconnect', function () {
        if (addedUser) {
            // echo globally that this client has left
            // socket.broadcast.emit('user left', socket.username);
        }
    });
}

exports.main_socket = main_socket;
