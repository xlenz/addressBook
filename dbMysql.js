var mysql = require('mysql');

var log;
var dbConfig = {};
exports.logger = function (srvLog) { log = srvLog }
exports.dbConfig = function (srvMysql) { dbConfig = srvMysql }

var usersTable = 'users';
var groupsTable = 'groups';
var contactsTable = 'contacts';

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);

    connection.connect(function(err) {
        if(err) {
            log.error('error when connecting to db:' + err);
            setTimeout(handleDisconnect, 2000);
        }
		else log.info('connection to MySQL established.')
    });

    connection.on('error', function(err) {
        log.error('db error: ' + err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

setTimeout(handleDisconnect, 1000);

exports.usrFindOne = function (map, callback) {
    query(usersTable, 'login', map.username, callback);
}

exports.usrFindById = function (id, callback) {
    query(usersTable, 'id', id, callback);
}

exports.usrCreate = function (username, pwd, callback) {
    var queryStr = "INSERT INTO {usersTable} (`login`, `password`) VALUES ('{login}', '{pwd}');"
        .format({
            usersTable: usersTable,
            login: username,
            pwd: pwd,
        });
    log.debug(queryStr);
    connection.query(queryStr, function (err, rows, fields) {
        if (err) {
            if (err.code == 'ER_DUP_ENTRY')
                callback('User with login ' + username + ' already exists.');
            else
                callback(err.code);
        } else if (rows && rows.length > 0)
            callback(null, rows.insertId);
        else
            callback(null, null);
    });
}

function query(tableName, columnName, value, callback) {
    var queryStr = "SELECT * from {tableName} where {columnName}='{value}'".format({
        tableName: tableName,
        columnName: columnName,
        value: value
    });
    log.debug(queryStr);
    connection.query(queryStr, function (err, rows) {
        if (err) callback(err.code);
        else if (rows && rows.length > 0)
            callback(null, rows[0]);
        else
            callback(null, null);
    });
}

if (!String.prototype.format) {
    String.prototype.format = function() {
        var str = this.toString();
        if (!arguments.length)
            return str;
        var args = typeof arguments[0],
            args = (("string" == args || "number" == args) ? arguments : arguments[0]);
        for (arg in args)
            str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
        return str;
    }
}
