var fs = require('fs');
var path = require('path');
var log4js = require('log4js');

if (!fs.existsSync('logs')) fs.mkdirSync('logs');

var server;
exports.server = function (srv) { server = srv }

var configName = 'config/config.json';
var config = JSON.parse(fs.readFileSync(configName));

log4js.configure(config.log_cfg_path);
var log = log4js.getLogger('main-logger');
log.setLevel('DEBUG');

var root_html = fs.readFileSync(config.root_html);

fs.watchFile(config.root_html, function (current, previous) {
    log.info('Reloading ' + config.root_html);
    root_html = fs.readFileSync(config.root_html);
	exports.root_html = root_html;
});

var signin_html = fs.readFileSync(config.signin_html);
fs.watchFile(config.signin_html, function (current, previous) {
    log.info('Reloading ' + config.signin_html);
    signin_html = fs.readFileSync(config.signin_html);
	exports.signin_html = signin_html;
});

var signup_html = fs.readFileSync(config.signup_html);
fs.watchFile(config.signup_html, function (current, previous) {
    log.info('Reloading ' + config.signup_html);
    signup_html = fs.readFileSync(config.signup_html);
	exports.signup_html = signup_html;
});

var user_html = fs.readFileSync(config.user_html);
fs.watchFile(config.user_html, function (current, previous) {
    log.info('Reloading ' + config.user_html);
    user_html = fs.readFileSync(config.user_html);
	exports.user_html = user_html;
});

fs.watchFile(configName, function (current, previous) {
    log.info('Reloading ' + configName);
    config = JSON.parse(fs.readFileSync(configName));
    server.close();
    server.listen(config.port, config.host, function () {
		log.info('Now listening - ' + (tools.host || '*') + ':' + (tools.port || 'default'));
    });
    exports.host = config.host;
    exports.port = config.port;
});

exports.logger = log;
exports.host = config.host;
exports.port = config.port;
exports.mongo = config.mongo;
exports.mysql = config.mysql;
exports.root_html = root_html;
exports.signin_html = signin_html;
exports.signup_html = signup_html;
exports.user_html = user_html;