var mysql = require('mysql');

var log;
var dbConfig = {};
exports.logger = function (srvLog) {
    log = srvLog
}
exports.dbConfig = function (srvMysql) {
    dbConfig = srvMysql
}

var usersTable = 'users';
var groupsTable = 'groups';
var contactsTable = 'contacts';

var connection;

function handleDisconnect () {
    connection = mysql.createConnection(dbConfig);

    connection.connect(function (err) {
        if (err) {
            log.error('error when connecting to db:' + err);
            setTimeout(handleDisconnect, 2000);
        } else log.info('connection to MySQL established.')
    });

    connection.on('error', function (err) {
        log.error('db error: ' + err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

setTimeout(handleDisconnect, 1000);

exports.usrFindOne = function (username, callback) {
    selectOne(usersTable, 'login', username, callback);
}

exports.usrFindById = function (id, callback) {
    selectOne(usersTable, 'id', id, callback);
}

exports.allContacts = function (user_id, callback) {
    var orderBy = 'firstName, lastName';
    selectAllOrderBy(contactsTable, 'user_id', user_id, orderBy, callback);
}

exports.groupContacts = function (group_id, callback) {
    var orderBy = 'firstName, lastName';
    selectAllOrderBy(contactsTable, 'group_id', group_id, orderBy, callback);
}

exports.userGroups = function (user_id, callback) {
    var orderBy = 'rank, name';
    selectAllOrderBy(groupsTable, 'user_id', user_id, orderBy, callback);
}

exports.contactDelete = function (id, user_id, callback) {
    deleteOne(contactsTable, 'id', id, user_id, callback);
}

exports.groupDelete = function (id, user_id, callback) {
    deleteOne(groupsTable, 'id', id, user_id, callback);
}

exports.usrCreate = function (username, pwd, callback) {
    var queryStr = "INSERT INTO {table} (`login`, `password`) VALUES ('{login}', '{pwd}');"
        .format({
            table: usersTable,
            login: username,
            pwd: pwd
        });
    exQuery(queryStr, 'User with login ' + username + ' already exists.', callback);
}

exports.groupCreate = function (user_id, name, callback) {
    var queryStr = "INSERT INTO {table} (`user_id`, `name`, `rank`) VALUES ('{user_id}', '{name}', '2');"
        .format({
            table: groupsTable,
            user_id: user_id,
            name: name
        });
    exQuery(queryStr, 'Group with name ' + name + ' already exists.', callback);
}

exports.groupUpdate = function (id, name, callback) {
    var queryStr = "UPDATE {table} set name='{name}' where id = {id};"
        .format({
            table: groupsTable,
            id: id,
            name: name
        });
    exQuery(queryStr, null, callback);
}

exports.contactCreate = function (contact, callback) {
    for (var key in contact) {
        if (contact[key] != null)
            contact[key] = "'" + contact[key] + "'";
    }
    var queryStr = "INSERT INTO {table} (`user_id`, `group_id`, `email`, `phone`, `firstName`, `lastName`) VALUES ({user_id}, {group_id}, {email}, {phone}, {firstName}, {lastName});"
        .format({
            table: contactsTable,
            user_id: contact.user_id,
            group_id: contact.group_id || null,
            email: contact.email,
            phone: contact.phone,
            firstName: contact.firstName,
            lastName: contact.lastName
        });
    exQuery(queryStr, null, callback);
}

exports.contactUpdate = function (contact, callback) {
    var contact_id = contact.id;
    delete contact.id;
    var user_id = contact.user_id;
    delete contact.user_id;
    var set = '';
    if (contact.group_id !== undefined) {
        set = ' group_id = ' + contact.group_id + ',';
        delete contact.group_id;
    }
    for (var key in contact) {
        if (contact[key] != null)
            set += ' ' + key + " = '" + contact[key] + "',";
    }
    if (set == '') return callback ('Nothing to update in contact.');
    var queryStr = "UPDATE {table} set{set} where id = {id} and user_id = {user_id};"
        .format({
            table: contactsTable,
            set: set.slice(0, -1),
            id: contact_id,
            user_id: user_id
        });
    exQuery(queryStr, null, callback);
}

function selectOne (tableName, columnName, value, callback) {
    var queryStr = "SELECT * from {table} where {columnName}='{value}';".format({
        table: tableName,
        columnName: columnName,
        value: value
    });
    select(queryStr, callback, 0);
}

function deleteOne (tableName, columnName, value, user_id, callback) {
    var queryStr = "DELETE from {table} where {columnName}='{value}' and user_id = {user_id};".format({
        table: tableName,
        user_id: user_id,
        columnName: columnName,
        value: value
    });
    exQuery(queryStr, null, callback);
}

function selectAllOrderBy (tableName, columnName, value, orderBy, callback) {
    var queryStr = "SELECT * from {table} where {columnName}='{value}' order by {orderBy};".format({
        table: tableName,
        columnName: columnName,
        value: value,
        orderBy: orderBy
    });
    select(queryStr, callback);
}

function select (queryStr, callback, rowNum) {
    log.debug(queryStr);
    connection.query(queryStr, function (err, rows) {
        if (err) callback(err.code);
        else if (rows && rows.length > 0) {
            if (rowNum != null)
                callback(null, rows[rowNum]);
            else
                callback(null, rows);
        }
        else
            callback(null, null);
    });
}

function exQuery (queryStr, err, callback) {
    log.debug(queryStr);
    connection.query(queryStr, function (err, rows) {
        log.warn(rows); // affectedRows //insertId
        if (err) {
            if (err.code == 'ER_DUP_ENTRY' && err)
                callback(err);
            else
                callback(err.code);
        } else if (rows && rows.affectedRows > 0)
            callback(null, rows);
        else
            callback(null, null);
    });
}

if (!String.prototype.format) {
    String.prototype.format = function () {
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
/*
exports.contactSetGroup = function (ids, group_id, user_id, callback) {
    var idList = '';
    for (var key in ids) {
        idList += ids[key] + ',';
    }
    if (idList == '') return callback ('No contacts to be set for group.');
    var queryStr = "UPDATE {table} set group_id={group_id} where id in ({idList}) and user_id={user_id};"
        .format({
            table: contactsTable,
            group_id: group_id,
            user_id: user_id,
            idList: idList.slice(0, -1)
        });
    exQuery(queryStr, null, callback);
}
*/
