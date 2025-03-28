function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (1 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function isSet(cname) {
    var cValue = getCookie(cname);
    if (cValue != 'null' && cValue != 'undefined' && cValue != '') {
        return true;
    } else {
        return false;
    }
}
