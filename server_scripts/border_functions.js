// --- REQUIRE ---
var ent = require('ent');
var fs = require('fs');
var csv = require('jquery-csv');

// --- CLASS DEFINITIONS ---
var rooms_list =  new function() {
  this.totalRoomsCount = 0,
  this.list = []
};

var game_properties =  new function() {
  this.maxPlayers = 12,
  this.maxAnswersDeckSize = 450,
  this.maxQuestionsDeckSize = 70,
  this.pointsToWin = 4,
  this.playerHandSize = 5
};

function Room(roomName, creatorName) {
  this.roomName = roomName;
  this.creatorName = creatorName;
  this.playing = false;
  this.playersList = [];
  this.answersDeck = [];
  this.questionsDeck = [];
  this.gameProperties = game_properties;
}

// --- ROOM FUNCTIONS ---
var findRoom = function(roomName) {
    for(var i = rooms_list.list.length - 1; i >= 0; i--) {
        if(rooms_list.list[i].roomName == roomName) {
            return rooms_list.list[i];
        }
    }
    return null;
}

var createRoom = function(roomName, creatorName) {
    // check if the room already exists
    if(findRoom(roomName) != null) {
        return false;
    } else {
        // if the room does not exist, create it
        var room = new Room(roomName, creatorName);
        rooms_list.list.push(room);
        if (joinRoom(roomName, creatorName)) {
            return true;
        } else {
            return false;
        }
    }
}

var joinRoom = function(roomName, pseudo) {
    room = findRoom(roomName);
    // if the room exists
    if (room != null) {
        // check if the user is already there
        var isPresent = false;
        for(var i = room.playersList.length - 1; i >= 0; i--) {
            if(room.playersList[i] == pseudo) {
                isPresent = true;
            }
        }
        if (!isPresent) {
            room.playersList.push(pseudo);
        }
        return true;
    } else {
        return false;
    }
}

var getRooms = function() {
    var listRooms = [];
    for (var i=0 ; i < rooms_list.list.length ; i++) {
        listRooms.push(rooms_list.list[i].roomName);
    }
    return listRooms;
}

var getPlayers = function(roomName) {
    if (roomName != "" && roomName != "null" && roomName != "undefined") {
        room = findRoom(roomName);
        return room.playersList;
    } else {
        return [];
    }
}

var leaveRoom = function(roomName, pseudo) {
    room = findRoom(roomName);
    // if the room exists
    if (room != null) {
        // check if the user is already there
        for(var i = room.playersList.length - 1; i >= 0; i--) {
            if(room.playersList[i] == pseudo) {
                room.playersList.splice(i, 1);
            }
        }
        if (room.playersList.length < 1) {
            deleteRoom(roomName);
        }
    }
}

var leaveAllRoom = function(pseudo) {
    for(var i = rooms_list.list.length - 1; i >= 0; i--) {
        leaveRoom(rooms_list.list[i].roomName, pseudo);
    }
}

var deleteRoom = function(roomName) {
    for(var i = rooms_list.list.length - 1; i >= 0; i--) {
        if(rooms_list.list[i].roomName == roomName) {
            rooms_list.list.splice(i, 1);
        }
    }
}

// --- GAME FUNCTIONS ---
var createQuestionsDeck = function(roomName) {
    var room = findRoom(roomName);
    var questionsLink = "./ressources/questions.csv";
    var questionsDeck = [];
    // create a question cards deck from the csv file
    var csvUnrefined = fs.readFileSync(questionsLink, "UTF-8");
    var tempQuestionsDeck = csv.toArrays(csvUnrefined, { separator:';', delimiter:";" });
    // create the random deck that the room will use
    for(var i = 0 ; i < room.gameProperties.maxQuestionsDeckSize ; i++) {
        var tempIndex = Math.floor(Math.random() * tempQuestionsDeck.length);
        questionsDeck.push(tempQuestionsDeck.splice(tempIndex, 1)[0][0]);
    }
    room.questionsDeck = questionsDeck;
}

var createAnswersDeck = function(roomName) {
    room = findRoom(roomName);
    var answersLink = "./ressources/reponses.csv";
    var answersDeck = [];
    // create a question cards deck from the csv file
    var csvUnrefined = fs.readFileSync(answersLink, "UTF-8");
    var tempAnswersDeck = csv.toArrays(csvUnrefined, { separator:';', delimiter:";" });
    // create the random deck that the room will use
    for(var i = 0 ; i < room.gameProperties.maxAnswersDeckSize ; i++) {
        var tempIndex = Math.floor(Math.random() * tempAnswersDeck.length);
        answersDeck.push(tempAnswersDeck.splice(tempIndex, 1)[0][0]);
    }
    room.answersDeck = answersDeck;
}

var drawOneAnswerCard = function(roomName) {
    room = findRoom(roomName);
    if (room.answersDeck.length > 0) {
        var randIndex = Math.floor(Math.random() * room.answersDeck.length);
        return room.answersDeck.splice([randIndex], 1);
    } else {
        return false;
    }
}

var drawOneQuestionCard = function(roomName) {
    room = findRoom(roomName);
    if (room.questionsDeck.length > 0) {
        var randIndex = Math.floor(Math.random() * room.questionsDeck.length);
        return room.questionsDeck.splice([randIndex], 1);
    } else {
        return false;
    }
}

var launchGame = function(roomName) {
    room = findRoom(roomName);
    createQuestionsDeck(roomName);
    createAnswersDeck(roomName);
}

// --- TEST ---
// variables for testing TO DELETE AFTER
/*
var firstRoomName = "rueil";
var secondRoomName = "paris";
var firstPlayer = "Georges";
var secondPlayer = "Bernadette";
var thirdPlayer = "Madeleine";

var tb = "tb";
var alice = "Alice";
var bob = "Bob";
var carlos = "Carlos";

createRoom(firstRoomName, firstPlayer);
createRoom(secondRoomName, secondPlayer);
joinRoom(firstRoomName, thirdPlayer);

createRoom(tb, alice);
joinRoom(tb, bob);
// joinRoom(tb, carlos);

// createQuestionsDeck('rueil');
// createAnswersDeck('rueil');
launchGame('rueil');
rueilRoom = findRoom('rueil');
// DEBUG: console.log("Questions : ", rueilRoom.questionsDeck);
// DEBUG: console.log("Answers : ", rueilRoom.answersDeck);
var tbRoom = findRoom("tb");
console.log("Players in tb : ", tbRoom.playersList);
*/

// --- EXPORTS ---
exports.createRoom = createRoom;
exports.joinRoom = joinRoom;
exports.getRooms = getRooms;
exports.getPlayers = getPlayers;
exports.leaveRoom = leaveRoom;
exports.leaveAllRoom = leaveAllRoom;
exports.deleteRoom = deleteRoom;
exports.drawOneAnswerCard = drawOneAnswerCard;
exports.drawOneQuestionCard = drawOneQuestionCard;
exports.launchGame = launchGame;
