addressBook
===========

Task1
* create/edit/update group/contact
* view all contacts/contacts per group
* search contact by first/last name

Server Side
* server: nodeJS + express, log4js, connect-mongo, mysql, passport, passport-local
* DBs: MySQL (data), mongoDB (sessions)

UI
* jQuery
* angularJS
* bootstrap
* bootbox

Installation
-----------
1. Have up and running mongoDb and MySQL (latest stable)
2. Execute _install\MySQL\createTables.mysql.sql in MySQL
3. Specify MySQL/mongoDB connection properties in config\log.config.json
4. Have nodeJS installed (latest stable)
5. Run _install\modules\modules_install.bat or install node modules specified above
6. Run server: node srv.js

MongoDB configuration for Windows (if you have never worked with mongo before)

1. Download mongoDB
2. Unpack it to desired path
3. Edit _install\mongoDb\service.bat
4. mongoPath = path to unpacked mongoDb folder (should contain bin folder)
5. mongoDataPath = path where mongoDb database will be stored
6. Run _install\mongoDb\service.bat
7. Run _install\db_start.bat

===========
Preveiw: http://37.57.205.52/

(server may be down or another service may be running)
