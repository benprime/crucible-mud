'use strict';

const express = require('express');

const app = express();
const http = require('http');

const serve = http.createServer(app);
const io = require('socket.io')(serve);

require('./extensionMethods');

// parses command files and prepares them
const commands = require('./commands/');
const settings = require('./settings');

const welcome = require('./welcome');
const loginUtil = require('./login');
const look = require('./commands/look');

// environment variables
const NODE_PORT = process.env.NODE_PORT;
const MONGO_DB = process.env.MONGO_DB;
const MONGO_PORT = process.env.MONGO_PORT;

app.set('port', NODE_PORT);
const mongoose = require('mongoose');

const db = mongoose.connection;

global.db = db;
global.io = io;

require('./combat');

mongoose.connect(`mongodb://localhost:${MONGO_PORT}/${MONGO_DB}`);
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {

  io.on('connection', (socket) => {

    socket.state = settings.STATES.LOGIN_USERNAME;
    socket.emit('output', { message: 'Connected.' });
    welcome.WelcomeMessage(socket);
    socket.emit('output', { message: 'Enter username:' });

    socket.on('disconnect', () => {
      if (socket.user) {
        socket.broadcast.emit('output', { message: `${socket.user.username} has left the realm.` });
      }
    });

    socket.on('command', (data) => {
      // todo: remove state logic when there is a login process
      switch (socket.state) {
        case settings.STATES.MUD:
          commands.Dispatch(socket, data.value);
          break;
        case settings.STATES.LOGIN_USERNAME:
          loginUtil.LoginUsername(socket, data);
          break;
        case settings.STATES.LOGIN_PASSWORD:
          loginUtil.LoginPassword(socket, data, () => {
            look.execute(socket);
          });
          break;
      }
    });
  });

  serve.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
  });
});
