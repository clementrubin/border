// Chat functions

// Send and print a message
$('#formulaire_chat').submit(function () {
    var message = $('#message').val();
    socket.emit('new message', message);
    if (connected) {
        // printing the message
        insereMessage(username, message, 1);
        $('#message').val('').focus();
        return false;
    }
});

// Add a message in the chat page
function insereMessage(username, message, me) {
    if (me == 1) {
        $('#zone_chat').prepend("<div class='section'><div class='pseudo its_me'>" + username + "</div><div class='comment'> " + message + '</div></div>');
    } else {
        $('#zone_chat').prepend("<div class='section'><div class='pseudo its_not_me'>" + username + "</div><div class='comment'> " + message + '</div></div>');
    }
}
