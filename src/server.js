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
import bodyParser from 'body-parser';
import userController from './api/userController';

const app = express();

// api validation middleware
app.use(bodyParser.json());

const serve = http.createServer(app);
const io = ioFactory(serve);

app.set('port', config.NODE_PORT);

const db = mongoose.connection;

global.db = db;
global.io = io;

moduleManager.loadModules();
let input;

mongoose.connect(`mongodb://localhost:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {

  // just a status page
  app.get('/', function (req, res) {
    res.send('OK');
  });

  // add api routes
  app.post(
    '/api/user/signup',
    userController.validateCreateUser(),
    userController.createUser,
  );

  // add api routes
  app.get(
    '/api/user/verify/:verifyHash',
    userController.verifyUser,
  );

  // setup socket server
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
