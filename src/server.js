import express from 'express';
import http from 'http';
import commands from './commands/';
import config from './config';
import welcome from './core/welcome';
import loginUtil from './core/login';
import look from './commands/look';
import ioFactory from 'socket.io';
import mongoose from 'mongoose';
import './core/combat';

const app = express();
const serve = http.createServer(app);
const io = ioFactory(serve);

// parses command files and prepares them

// environment variables
const NODE_PORT = process.env.NODE_PORT || 3000;
const MONGO_DB = process.env.MONGO_DB || 'mud';
const MONGO_PORT = process.env.MONGO_PORT || 27017;

app.set('port', NODE_PORT);


const db = mongoose.connection;

global.db = db;
global.io = io;


mongoose.connect(`mongodb://localhost:${MONGO_PORT}/${MONGO_DB}`);
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {

  io.on('connection', (socket) => {

    socket.state = config.STATES.LOGIN_USERNAME;
    socket.emit('output', { message: 'Connected.' });
    welcome.WelcomeMessage(socket);
    socket.emit('output', { message: 'Enter username:' });

    socket.on('disconnect', () => {
      if (socket.character) {
        socket.broadcast.emit('output', { message: `${socket.user.username} has left the realm.` });
      }
    });

    socket.on('command', (data) => {
      // todo: remove state logic when there is a login process
      switch (socket.state) {
        case config.STATES.MUD:
          commands.Dispatch(socket, data.value);
          break;
        case config.STATES.LOGIN_USERNAME:
          loginUtil.LoginUsername(socket, data);
          break;
        case config.STATES.LOGIN_PASSWORD:
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
