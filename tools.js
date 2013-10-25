var fs = require('fs');
var path = require('path');
var log4js = require('log4js');

if (!fs.existsSync('logs')) fs.mkdirSync('logs');

var server;
exports.server = function (srv) {
    server = srv
}

var configName = 'config/config.json';
var config = JSON.parse(fs.readFileSync(configName));

log4js.configure(config.log_cfg_path);
var log = log4js.getLogger('main-logger');
log.setLevel('DEBUG');

var root_html = fs.readFileSync(config.root_html);
watchHtml(config.root_html, root_html, function(htmlFile) {exports.root_html = htmlFile});

var signin_html = fs.readFileSync(config.signin_html);
watchHtml(config.signin_html, signin_html, function(htmlFile) {exports.signin_html = htmlFile});

var signup_html = fs.readFileSync(config.signup_html);
watchHtml(config.signup_html, signup_html, function(htmlFile) {exports.signup_html = htmlFile});

var user_html = fs.readFileSync(config.user_html);
watchHtml(config.user_html, user_html, function(htmlFile) {exports.user_html = htmlFile});

fs.watchFile(configName, function (current, previous) {
    log.info('Reloading ' + configName);
    config = JSON.parse(fs.readFileSync(configName));
    server.close();
    server.listen(config.port, config.host, function () {
        log.info('Now listening - ' + (config.host || '*') + ':' + (config.port || 'default'));
    });
});

function watchHtml (htmlFilePath, htmlFile, callback) {
        fs.watchFile(htmlFilePath, function (current, previous) {
        log.info('Reloading ' + htmlFilePath);
        htmlFile = fs.readFileSync(htmlFilePath);
        callback(htmlFile);
    });
}

exports.logger = log;
exports.host = config.host;
exports.port = config.port;
exports.mongo = config.mongo;
exports.mysql = config.mysql;
exports.root_html = root_html;
exports.signin_html = signin_html;
exports.signup_html = signup_html;
exports.user_html = user_html;