var log;
exports.logger = function (logger) {
    log = logger
}

exports.validateEmail = function (email) {
    log.trace('validateEmail: ' + email);
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function trim(s) {
    log.trace('trim: ' + s);
    s = s.replace(/(^\s*)|(\s*$)/gi, "");
    s = s.replace(/[ ]{2,}/gi, " ");
    s = s.replace(/\n /, "\n");
    return s;
}

exports.validatePassword = function (s) {
    log.trace('validatePassword: ' + s);
    var re = /^([a-zA-Z0-9~!@#$%^&*()_+-=]+)$/;
    var r = '';
    if (re.test(s))
        r = trim(s);

    if (s === r && s.length > 2) return true;
    else return false;
}

exports.validateInput = function (s) {
    log.trace('validateInput: ' + s);
    if (!s) return null;
    var r = s.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');
    if (s === r) {
        s = trim(s);
        if (s != '')
            return s;
    }
    return null;
}

exports.validatePhone = function (s) {
    log.trace('validateInput: ' + s);
    var re = /^([0-9~()\s+-]+)$/;
    return re.test(s);
}

/*
exports.verifyInteger = function (val) {
    var intRegex = /^-{0,1}\d*\.{0,1}\d+$/;
    if (intRegex.test(val) && !isNaN(val, 10)) return parseInt(val, 10);
    return null;
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++)
        if ((new Date().getTime() - start) > milliseconds) break;
}
*/
