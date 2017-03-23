'use strict';

const express = require('express');

const app = express();
const http = require('http');

const serve = http.createServer(app);
// convert to global.io... see if we can remove all the references of passing this around
const io = require('socket.io')(serve);

const globals = require('./globals');
const commands = require('./commands/');
const combat = require('./combat');
const welcome = require('./welcome');
const loginUtil = require('./login');
const look = require('./commands/look');

app.set('port', 3000);

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mud');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {

  // set a global reference to the database
  globals.DB = db;

  io.on('connection', (socket) => {

    /*
    const roomModel = require('./models/room');
    let test = new roomModel.Room();
    test.name = "TESTING";
    test.desc = "MOAR TESTING";
    test.x = -10;
    test.y = -10;
    test.z = -10;
    test.save(function(err, testRoom) {
      console.log("err", err);
      console.log("testRoom", testRoom);
    });
    */




    socket.state = globals.STATES.LOGIN_USERNAME;
    socket.emit('output', { message: 'Connected.' });
    welcome.WelcomeMessage(socket);
    socket.emit('output', { message: 'Enter username:' });

    socket.on('disconnect', () => {
      // check to see if this user ever successfully logged in
      if (socket.id in globals.USERNAMES) {
        combat.MobDisengage(socket);
        socket.broadcast.emit('output', { message: `${globals.USERNAMES[socket.id]} has left the realm.` });
        delete globals.USERNAMES[socket.id];
      }
    });

    socket.on('command', (data) => {
      // todo: remove state logic when there is a login process
      switch (socket.state) {
        case globals.STATES.MUD:
          commands.Dispatch(socket, data.value);
          break;
        case globals.STATES.LOGIN_USERNAME:
          loginUtil.LoginUsername(socket, data);
          break;
        case globals.STATES.LOGIN_PASSWORD:
          loginUtil.LoginPassword(socket, data, () => {
            look.execute(socket);
          });
          break;
      }
    });
  });

  global.db = db;
  global.io = io;

  serve.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
  });
});
