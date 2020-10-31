var express = require('express');
var router = express.Router();
var path = require('path');

// main page
router.get('/', function(req, res) { res.render('index') });
// chat page
router.get('/chat', function(req, res) { res.render('chat.ejs') });
// game page
router.get('/game', function(req, res) { res.render('game.ejs') });
// room page
router.get('/game/room', function(req, res) {
    var roomName = req.query.roomName;
    res.render('game_room.ejs', { roomName: roomName });
});
// style sheets
router.use('/styles', express.static(path.join(__dirname, '/styles')));
// script sheets
router.use('/client_scripts', express.static(path.join(__dirname, '/client_scripts')));
// in case of wrong url
router.use(function(req, res, next){
    res.status(404).render('not_found.ejs');
});

module.exports = router;
