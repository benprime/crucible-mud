'use strict';

const express = require('express');
const app = express();
const http = require('http');
const serve = http.createServer(app);
const io = require('socket.io')(serve);
const globals = require('./globals');
const dirUtil = require('./direction');
const adminUtil = require('./admin')(io);
const commands = require('./commands')(io);
const combat = require('./combat')(io);
const mongo = require('mongodb').MongoClient;
const welcome = require('./welcome');
const loginUtil = require('./login')(io);

app.set('port', 3000);
const url = 'mongodb://localhost:27017/mud';

mongo.connect(url, (err, db) => {
  if (!db) {
    console.log(`Could not connect to mongo! ${err}`);
    process.exit(-1);
  }

  // set a global reference to the database
  globals.DB = db;

  io.on('connection', (socket) => {
    socket.state = globals.STATES.LOGIN_USERNAME;
    socket.emit('output', { message: 'Connected.' });
    welcome.WelcomeMessage(socket);
    socket.emit('output', { message: 'Enter username:' });

    socket.on('disconnect', () => {
      // check to see if this user ever successfully logged in
      if (socket.id in globals.USERNAMES) {
        socket.broadcast.emit('output', { message: `${globals.USERNAMES[socket.id]} has left the realm.` });
        delete globals.USERNAMES[socket.id];
      }
    });

    socket.on('command', (data) => {
      switch (socket.state) {
        case globals.STATES.MUD:
          commands.CommandDispatch(socket, data);
          break;
        case globals.STATES.LOGIN_USERNAME:
          loginUtil.LoginUsername(socket, data);
          break;
        case globals.STATES.LOGIN_PASSWORD:
          loginUtil.LoginPassword(socket, data, (socket) => {
            commands.Look(socket);
          });
          break;
      }
    });
  });

  serve.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
  });
});
