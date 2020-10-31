//Border variables
var selectedCard = "";
var selectedValue = "";
var slave_time = false;
var master_time = false;

// Border Functions

function createRoom(room_name) {
    socket.emit('create_room', room_name);
}

function joinRoom(room_name) {
    socket.emit('join_room', room_name);
}

var updateRoomsList = function(rooms_list) {
    var listHTML = "<ul>";
    for(var i = 0; i < rooms_list.length; i++) {
        listHTML += "<li>";
        listHTML += rooms_list[i];
        listHTML += "</li>";
    }
    listHTML += "</ul>";
    document.getElementById("rooms").innerHTML = listHTML ;
}

// Border Room Functions

var updateRoomPlayers = function(playersList) {
    var listHTML = "<ul>";
    for(var i = 0; i < playersList.length; i++) {
        listHTML += "<li>";
        listHTML += playersList[i];
        listHTML += "</li>";
    }
    listHTML += "</ul>";
    document.getElementById("players").innerHTML = listHTML ;
}

// Border Room Actions

function launchGame() {
    socket.emit('launch_game', getCookie("roomName"));
    setTimeout(function () {
        callNewTurn("");
    }, 500);
}

function callNewTurn(name) {
    socket.emit('new_turn', {room_name: getCookie("roomName"), name: name});
}

function newTurn(card, master_name) {
    // Display the new question card
    var content = "<p>" + card + "</p>";
    document.getElementById('question_card').innerHTML = content;
    // Reset the selection of the answer cards
    if (selectedCard != "") {
        $('#'+selectedCard).removeClass('selected_card');
        socket.emit('ask_for_card', {room_name: getCookie('roomName'), index: selectedCard});
        selectedCard = "";
        selectedValue = "";
    }
    // Remove all the master answer cards
    $('.master_answer_card').remove();
    // Register the master and do some stuff if it's us
    console.log("Master is ", master_name);
    // if (getCookie("username") == master_name) { ------ check here
    if (username == master_name) {
        isMaster = true;
        document.getElementById('master_name').innerHTML = "I am the master";
        document.getElementById('game_master').style.display="flex";
        document.getElementById('game_slave').style.display="none";
    } else {
        isMaster = false;
        document.getElementById('master_name').innerHTML = master_name + " is master";
        document.getElementById('game_master').style.display="none";
        document.getElementById('game_slave').style.display="flex";
    }
    master_time = false;
    slave_time = true;
    console.log("I'm the master : ", isMaster);
}

function addAnswerCard(value, name) {
    var newCardHtml = "<div class='master_answer_card'><p>" + value + "</p><p style='display: none'>" + name + "</p></div>"
    document.getElementById('game_master').innerHTML += newCardHtml;
    if (isMaster) {
        $('.master_answer_card').click( function() {
            if (master_time) {
                selectedValue = this.getElementsByTagName('p')[0].innerHTML;
                selectedName = this.getElementsByTagName('p')[1].innerHTML;
                console.log("I choose ", selectedName, " with ", selectedValue);
                selectTurnWinner(selectedName, selectedValue);
            }
        });
    }
}

function selectAnswer(card, value) {
    socket.emit('select_answer', { card: card, value: value, username: username});
    document.getElementById('game_master').style.display="flex";
    document.getElementById('game_slave').style.display="none";
    addAnswerCard(value, username);
}

function endSlaveTurn() {
    slave_time = false;
    master_time = true;
    document.getElementById('game_master').style.display="flex";
    document.getElementById('game_slave').style.display="none";
}

function selectTurnWinner(name, value) {
    socket.emit('select_winner', { name: name, value: value});
    callNewTurn(name);
}

function leaveRoom() {
    socket.emit('leave_room', getCookie('roomName'));
    setCookie("roomName", "");
    window.location.replace("/game");
}

function deleteRoom() {
}

// Border Actions

// Create a room
$('#create_room_form').submit(function () {
    var room_name = $('#create_room_name').val();
    $('#room_name').val('').focus(); // clearing the input
    createRoom(room_name);
    return false; // block the normal submition of the form
});

// Join a room
$('#join_room_form').submit(function () {
    var room_name = $('#join_room_name').val();
    joinRoom(room_name);
    return false; // block the normal submition of the form
});
