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

function logWho (req) {
    log.debug(req.headers['x-forwarded-for'] || req.connection.remoteAddress + ' requests: ' + req.headers.host + req.url);
}

var myRequests = require('./requests.js');
myRequests.init({
    app: app,
    log: log,
    passport: passport,
    logWho: logWho,
    tools: tools,
    dbMysql: dbMysql,
    helpers: helpers
});
