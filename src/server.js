import express from 'express';
import http from 'http';
import config, { globalErrorHandler } from './config';
import welcome from './core/welcome';
import { verifyToken, addUserToRealm } from './core/authentication';
import ioFactory from 'socket.io';
import mongoose from 'mongoose';
import './core/dayCycle';
import socketUtil from './core/socketUtil';
import moduleManager from './core/moduleManager';
import commandHandler from './core/commandHandler';
import bodyParser from 'body-parser';
import userController from './api/userController';
import https from 'https';
import fs from 'fs';

const app = express();

// allow express to work with let's encrypt
//app.use(express.static(__dirname + '/static', { dotfiles: 'allow' } ));

// api validation middleware
app.use(bodyParser.json());

const devMode = (!process.env.NODE_ENV || process.env.NODE_ENV.trim() === 'development');

console.log('Environment:', process.env.NODE_ENV);
console.log('Development Mode:', devMode);

// SSL certificates
let serve;
if (!devMode) {
  const credential = {
    key: fs.readFileSync('/etc/letsencrypt/live/develop.cruciblemud.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/develop.cruciblemud.com/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/develop.cruciblemud.com/chain.pem'),
  };
  serve = https.createServer(credential, app);
} else {
  serve = http.createServer(app);
}

const io = ioFactory(serve);
app.set('port', config.NODE_PORT);

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


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

  app.post(
    '/api/user/login',
    userController.validateLogin(),
    userController.login,
  );

  // add api routes
  app.get(
    '/api/user/verify/:verifyHash',
    userController.verifyUser,
  );

  // authentication middleware function
  io.use((socket, next) => {
    let token = socket.handshake.query.token;
    if (verifyToken(token)) return next();
    next(new Error('Authentication required'));
  }).on('connection', (socket) => {

    let token = socket.handshake.query.token;
    let tokenData = verifyToken(token);
    if (!tokenData) {
      // disconnect?
      console.log('ERRORS!!!!!');
      return;
    }

    socket.emit('output', { message: 'Connected.' });
    welcome.WelcomeMessage(socket);
    addUserToRealm(socket, tokenData.data);


    socket.on('disconnect', () => {
      if (socket.character) {
        socketUtil.getAllSockets().forEach(s => socketUtil.output(s, `<span class="yellow">${socket.character.name} has left the realm.</span>`));
      }
    });

    socket.on('command', (data) => {
      input = data.value;
      try {
        commandHandler.processDispatch(socket, input);
      } catch (err) {
        globalErrorHandler(err);
        socket.character.output(err);
      }
    });
  });

  serve.listen(app.get('port'), () => {
    console.log(`CrucibleMUD server running on port ${app.get('port')}`);
  });
});
