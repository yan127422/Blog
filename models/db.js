var http = require('http');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
 
var port = 27017;
 
var db_name = 'test';                  // 数据库名，从云平台获取
var db_host = '127.0.0.1';      // 数据库地址
var db_port = port;   // 数据库端口
var username = 'test';                 // 用户名
var password = 'pwd';                 // 密码
 
var db = new Db(db_name, new Server(db_host, db_port, {}), {w: 1});
module.exports = db;


