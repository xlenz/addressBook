var express = require('express');
var helpers = require('./helpers.js');
var tools = require('./tools.js');
var dbMysql = require('./dbMysql.js');

var log = tools.logger;
dbMysql.logger(log);
dbMysql.dbConfig(tools.mysql);
helpers.logger(log);

var MongoStore = require('connect-mongo')(express);

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        dbMysql.usrFindOne(username, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            if (password != user.password) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    dbMysql.usrFindById(id, function (err, user) {
        done(err, user);
    });
});

var app = express(),
    http = require('http'),
    server = http.createServer(app);

app.configure(function () {
    app.use(express.static(__dirname + '/web'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({
        secret: 'task js course',
        cookie: {
            maxAge: 604800000 //one week, one hour - 3600000
        },
        store: new MongoStore(tools.mongo)
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(function (req, res, next) {
        res.status(404);
        log.warn('Not found URL:');
        logWho(req);
        res.send({
            error: 'Resource not found',
            code: 404
        });
        return;
    });
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        log.error('Internal error(%d): %s', res.statusCode, err.message);
        logWho(req);
        log.debug('req.body:\n', req.body);
        return res.send({
            error: err.message,
            code: 500
        });
    });
});

server.listen(tools.port, tools.host, function () {
    log.info('Listening - ' + (tools.host || '*') + ':' + (tools.port || 'default'));
});
tools.server(server);

app.get("/", function (req, res) {
    logWho(req);
    if (req.isAuthenticated())
        return res.redirect('/user/me');
    log.trace('Sending ' + tools.root_html);
    res.setHeader("Content-Type", "text/html");
    res.send(tools.root_html);
});

app.get("/user/:id", function (req, res) {
    logWho(req);
    if (!req.isAuthenticated())
        return res.redirect('/');
    if (req.params.id != 'me')
        return res.redirect('/user/me');
    log.trace('Sending ' + tools.user_html);
    res.setHeader("Content-Type", "text/html");
    res.send(tools.user_html);
});


app.get("/signup", function (req, res) {
    logWho(req);
    if (req.isAuthenticated())
        return res.redirect('/');
    log.trace('Sending ' + tools.signup_html);
    res.setHeader("Content-Type", "text/html");
    res.send(tools.signup_html);
});

app.post("/signup", function (req, res) {
    logWho(req);
    if (req.isAuthenticated())
        return res.send({
            success: false,
            message: 'You are already logged in.'
        });
    log.debug(req.body);
    var errors = '';
    if (!helpers.validateInput(req.body.username))
        errors += 'Proper login is required<br/>'

    if (!req.body.password || !helpers.validatePassword(req.body.password))
        errors += 'Password is required, should be minimum 3 symbols length and can contain only a-z, A-Z, 0-9 and symbols ~!@#$%^&*()_+-=';

    if (errors != '') {
        return res.send({
            success: false,
            message: errors
        });
    }

    dbMysql.usrCreate(req.body.username, req.body.password, function (err, user) {
        if (err) {
            res.send({
                success: false,
                message: err
            });
        } else res.send({
            success: true,
            message: user
        });
    });
});

app.get("/login", function (req, res) {
    logWho(req);
    if (req.isAuthenticated())
        return res.redirect('/');
    log.trace('Sending ' + tools.signin_html);
    res.setHeader("Content-Type", "text/html");
    res.send(tools.signin_html);
});

app.post('/login', function (req, res, next) {
    logWho(req);
    if (req.isAuthenticated())
        return res.send({
            success: false,
            message: 'You are already logged in.'
        });
    log.debug(req.body);
    if (!helpers.validateInput(req.body.username)) {
        return res.send({
            success: false,
            message: 'authentication failed: incorrect login'
        });
    }
    if (req.body.password && !helpers.validatePassword(req.body.password)) {
        return res.send({
            success: false,
            message: 'authentication failed: incorrect password'
        });
    }
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.send({
                success: false,
                message: 'authentication failed'
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.send({
                    success: false,
                    message: 'authentication failed'
                });
            }
            return res.send({
                success: true,
                message: 'authentication succeeded'
            });
        });
    })(req, res, next);
})

app.post("/user/:id", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;

    if (req.params.id == 'me') {
        var map = {};
        map.success = true;
        map.user = req.user;
        delete map.user.password;
        return res.send(map);
    }

    return res.send({
        success: false,
        message: 'It is possible to view only currently logged in user.'
    });
});

app.get("/allContacts", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;
    dbMysql.allContacts(req.user.id, function (err, data) {
        if (err) res.send(err);
        else res.send(data);
    });
});

app.post("/groupContacts", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;
    dbMysql.groupContacts(req.body.group_id, function (err, data) {
        if (err) res.send(err);
        else res.send(data);
    });
});

app.get("/userGroups", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;
    dbMysql.userGroups(req.user.id, function (err, data) {
        if (err) res.send(err);
        else res.send(data);
    });
});

app.post("/contactDelete", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;
    dbMysql.contactDelete(req.body.id, req.user.id, function (err, data) {
        if (err) res.send({
            success: false,
            message: err
        });
        else res.send(data);
    });
});

app.post("/groupDelete", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;
    dbMysql.groupDelete(req.body.id, req.user.id, function (err, data) {
        if (err) res.send({
            success: false,
            message: err
        });
        else res.send(data);
    });
});

app.post("/groupCreate", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;

    var errors = [];
    if (!helpers.validateInput(req.body.name))
        errors.push('Proper name is required');
    if (req.body.name.length > 30)
        errors.push('Group name should be less then 30 symbols');
    if (errors.length > 0) {
        return res.send({
            success: false,
            message: errors
        });
    }

    dbMysql.groupCreate(req.user.id, helpers.trim(req.body.name), function (err, data) {
        if (err) res.send({
            success: false,
            message: err
        });
        else res.send(data);
    });
});

app.post("/groupUpdate", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;

    var errors = [];

    if (!helpers.validateInput(req.body.name))
        errors.push('Proper name is required');
    if (req.body.name.length > 30)
        errors.push('Group name should be less then 30 symbols');
    if (errors.length > 0) {
        return res.send({
            success: false,
            message: errors
        });
    }

    dbMysql.groupUpdate(req.body.id, helpers.trim(req.body.name), function (err, data) {
        if (err) res.send({
            success: false,
            message: err
        });
        else res.send(data);
    });
});

app.post("/contactCreate", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;

    var errors = [];
    if (!helpers.validateInput(req.body.firstName))
        errors.push('First Name is invalid');
    if (req.body.lastName && !helpers.validateInput(req.body.lastName))
        errors.push('Last Name is invalid');
    if (req.body.email && !helpers.validateEmail(req.body.email))
        errors.push('Email is invalid');
    if (req.body.phone && !helpers.validatePhone(req.body.phone))
        errors.push('Phone is invalid');

    if (errors.length > 0) {
        return res.send({
            success: false,
            message: errors
        });
    }

    var contact = {};
    contact.id = req.body.id;
    contact.user_id = req.user.id;
    contact.group_id = req.body.group_id;
    contact.email = req.body.email;
    contact.phone = req.body.phone;
    contact.firstName = req.body.firstName;
    contact.lastName = req.body.lastName;

    dbMysql.contactCreate(contact, function (err, data) {
        if (err) res.send({
            success: false,
            message: err
        });
        else res.send(data);
    });
});

app.post("/contactUpdate", function (req, res) {
    logWho(req);
    if (!isAuth(req, res)) return;

    var errors = [];
    if (!helpers.validateInput(req.body.firstName))
        errors.push('First Name is invalid');
    if (req.body.lastName && !helpers.validateInput(req.body.lastName))
        errors.push('Last Name is invalid');
    if (req.body.email && !helpers.validateEmail(req.body.email))
        errors.push('Email is invalid');
    if (req.body.phone && !helpers.validatePhone(req.body.phone))
        errors.push('Phone is invalid');

    if (errors.length > 0) {
        return res.send({
            success: false,
            message: errors
        });
    }

    var contact = {};
    contact.id = req.body.id;
    contact.user_id = req.user.id;
    contact.group_id = req.body.group_id;
    contact.email = req.body.email;
    contact.phone = req.body.phone;
    contact.firstName = req.body.firstName;
    contact.lastName = req.body.lastName;

    dbMysql.contactUpdate(contact, function (err, data) {
        if (err) res.send({
            success: false,
            message: err
        });
        else res.send(data);
    });
});

app.get('/logout', function (req, res) {
    logWho(req);
    req.logout();
    res.redirect('/');
});

function logWho (req) {
    log.debug(req.headers['x-forwarded-for'] || req.connection.remoteAddress + ' requests: ' + req.headers.host + req.url);
}

function isAuth (req, res) {
    if (!req.isAuthenticated()) {
        res.send({
            success: false,
            message: 'You must be logged in.'
        });
        return false;
    }
    return true;
}

/*
app.post("/contactSetGroup", function (req, res) {
    if (!req.isAuthenticated())
        return res.send({
            success: false,
            message: 'You must be logged in.'
        });
    dbMysql.contactSetGroup(req.body.ids, req.body.group_id, req.user.id, function(err, data){
        if (err) res.send(err);
        else res.send(data);
    });
});
*/
