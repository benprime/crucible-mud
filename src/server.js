import express from 'express';
import http from 'http';
import config, { globalErrorHandler } from './config';
import welcome from './core/welcome';
import login from './core/login';
import ioFactory from 'socket.io';
import mongoose from 'mongoose';
import './core/dayCycle';
import socketUtil from './core/socketUtil';
import moduleManager from './core/moduleManager';
import commandHandler from './core/commandHandler';


const app = express();
const serve = http.createServer(app);
const io = ioFactory(serve);

// environment variables
const NODE_PORT = process.env.NODE_PORT || 3000;
const MONGO_DB = process.env.MONGO_DB || 'mud';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';

app.set('port', NODE_PORT);

const db = mongoose.connection;

global.db = db;
global.io = io;

moduleManager.loadModules();
let input;

mongoose.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`);
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {

  io.use((socket, next) => {
    login.tokenLogin(socket);
    return next();
  }).on('connection', (socket) => {
    socket.emit('output', { message: 'Connected.' });
    welcome.WelcomeMessage(socket);

    if (socket.state === 0) {
      socket.emit('output', { message: 'Enter username:' });
    }

    socket.on('disconnect', () => {
      if (socket.character) {
        socketUtil.getAllSockets().forEach(s => socketUtil.output(s, `<span class="yellow">${socket.character.name} has left the realm.</span>`));
      }
    });

    socket.on('command', (data) => {
      // todo: remove state logic when there is a login process
      switch (socket.state) {
        case config.STATES.MUD:
          input = data.value;
          try {
            commandHandler.processDispatch(socket, input);
            // .catch(err => {
            //   globalErrorHandler(err);
            //   socket.character.output(err);
            // });
          } catch (err) {
            globalErrorHandler(err);
            socket.character.output(err);
          }

          break;
        case config.STATES.LOGIN_USERNAME:
          login.loginUsername(socket, data);
          break;
        case config.STATES.LOGIN_PASSWORD:
          login.loginPassword(socket, data);
          break;
      }
    });
  });

  serve.listen(app.get('port'), () => {
    console.log(`CrucibleMUD server running on port ${app.get('port')}`);
  });
});
