// variables for setting a username
var username = "";
var connected = false;
var isMaster = false;

// var socket = io({transports: ['websocket'], path: '/border/socket.io'});
// var socket = io('http://localhost:6969', {transports: ['websocket']});
// var socket = io('http://www.c***r', {path: '/border/socket.io'}); // works well on the master
var socket = io({path: '/border/socket.io'}); // works well on the master

var setUsername = function() {
    if (isSet('username')) {
        username = getCookie('username');
    } else {
        username = prompt("Pseudo? (max 15 caractères)");
    }
}

// Set the username and send it
do { setUsername(); }
while (username == "" || username.length > 15);
// If the username is valid
if (username) {
  // Tell the server your username
  setCookie('username', username);
  socket.emit('new user', username);
  document.title = document.title + ' - ' + username  ;
  document.getElementById("intro_title").innerHTML = document.getElementById("intro_title").innerHTML + ' - ' + username ;
}

// Socket events

// Whenever the server emits 'login'
socket.on('login', function () {
  connected = true;
  console.log(username, " is now connected !");
});

// Whenever the server emits 'new message', add it to the chat room
socket.on('new message', function (data) {
  insereMessage(data.username, data.message, false);
});

// Whenever the server emits 'user joined', add it to the chat room
socket.on('user joined', function(username) {
    $('#zone_chat').prepend("<div class='section'><div class='pseudo its_not_me'>" + username + "</div><div class='comment'><em> a rejoint le Chat !</em></div></div>");
});

// Whenever the server emits 'user left', log it in the chat body
socket.on('user left', function (username) {
  $('#zone_chat').prepend("<div class='section'><div class='pseudo its_not_me'>" + username + "</div><div class='comment'><em> a quitté le Chat !</em></div></div>");
});

// Whenever the room is created or ready to join, the player can join it
socket.on('room_ready', function(room_name) {
    setCookie("roomName", room_name);
    window.location.replace("./game/room?roomName="+room_name);
});

// Whenever the server updates the players list of a room
socket.on('update_rooms_list', function(rooms_list) {
    updateRoomsList(rooms_list);
});

// Whenever the server updates the players list of a room
socket.on('update_players_list', function(data) {
    if (getCookie("roomName") == data.room_name) {
        updateRoomPlayers(data.players_list);
    }
});

// Whenever the game is launched
socket.on('game_launched', function(room_name) {
    // Check if the room corresponds
    if (getCookie("roomName") == room_name) {
        for(var i = 0 ; i < 5 ; i++) {
            var index = "card"+i.toString();
            socket.emit('ask_for_card', {room_name: room_name, index: index});
        }
    }
});

// Whenever a new turn is launched
socket.on('new_turn', function(data) {
    if (getCookie("roomName") == data.room_name) {
        newTurn(data.card, data.master_name);
    }
});

// Whenever a new card is received, it is going at the right place
socket.on('new_card', function(data) {
    var content = "<p>" + data.card + "</p>";
    var index = data.index;
    document.getElementById(index).innerHTML = content;
});

// Whenever a new master answer card is received, it is going at the right place
socket.on('new_answer', function(data) {
    addAnswerCard(data.value, data.username)
});

// Timer
socket.on('time', function(data) {
    if (getCookie('roomName') == data.room_name) {
        document.getElementById('timer').innerHTML = data.t;
        if (data.t == 0) {
            endSlaveTurn();
        }
    }
});
