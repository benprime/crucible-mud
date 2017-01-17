var express = require('express');
var app = express();
var http = require('http');
var serve = http.createServer(app);
var io = require('socket.io')(serve);
var dirUtil = require('./direction');
var adminUtil = require('./admin')(io);
var loginUtil = require('./login')(io);
var globals = require('./globals');
var commands = require('./commands')(io);
var combat = require('./combat')(io);
var mongo = require('mongodb').MongoClient;
var welcome = require('./welcome');

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
    socket.state = globals.STATES.LOGIN_USERNAME;
    socket.emit('output', { message: "Connected." });
    welcome.WelcomeMessage(socket);
    socket.emit('output', { message: "Enter username:" });



    socket.on('disconnect', function() {
      // check to see if this user ever successfully logged in
      if (socket.id in globals.USERNAMES) {
        // save current room to user data
        //todo: Hrmm, if the server crashes, everyone's current location will be lost... perhaps write to mongo on every move.
        var result = globals.DB.collection('users').update({ _id: socket.userId }, { $set: { "roomId": socket.room._id } });

        socket.broadcast.emit('output', { message: globals.USERNAMES[socket.id] + ' has left the realm.' });
        delete globals.USERNAMES[socket.id];
      }
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
    });

  });

  serve.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
});
