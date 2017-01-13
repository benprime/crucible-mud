var express = require('express');
var app = express();
var http = require('http');
var serve = http.createServer(app);
var io = require('socket.io')(serve);
var dirUtil = require('./direction');
var adminUtil = require('./admin')(io);
var loginUtil = require('./login');
var globals = require('./globals');
var commands = require('./commands')(io);
var mongo = require('mongodb').MongoClient;

module.exports = io;

app.set('port', 3000);
var url = 'mongodb://localhost:27017/mud';

mongo.connect(url, function(err, db) {
  if (!db) {
    console.log("Could not connect to mongo! " + err)
    process.exit(-1);
  }

  // set a global reference to the database
  globals.DB = db;

  io.on('connection', function(socket) {
    //console.log('a user connected');
    socket.state = globals.STATES.LOGIN_USERNAME;
    socket.emit('output', { message: "Connected." });
    socket.emit('output', { message: "Enter username:" });



    socket.on('disconnect', function() {
      //console.log(JSON.stringify(socket));
      socket.broadcast.emit('output', { message: globals.USERNAMES[socket.id] + ' has left the realm.' });
      delete globals.USERNAMES[socket.id];
      //console.log('user disconnected');
    });

    socket.on('command', function(data) {

      switch (socket.state) {
        case globals.STATES.MUD:
          commands.CommandDispatch(socket, data);
          break;
        case globals.STATES.LOGIN_USERNAME:
          loginUtil.LoginUsername(socket, data);
          break;
        case globals.STATES.LOGIN_PASSWORD:
          loginUtil.LoginPassword(socket, data, function(socket) {
          	commands.Look(socket);
          });
          break;

      }

      if (socket.state != globals.STATES.MUD) {
        return;
      }

    });




  });

  serve.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
});


