'use strict';

const socketUtil = require('./socketUtil');
const config = require('../../config');
const hud = require('./hud');
const Room = require('../models/room');
const User = require('../models/user');

module.exports = {
  LoginUsername(socket, username) {
    if (!socket.userId && (socket.state == config.STATES.LOGIN_USERNAME)) {
      User.findByName(username.value, function (err, user) {
        if (!user) {
          socket.emit('output', { message: 'Unknown user, please try again.' });
        } else {
          // todo: maybe we don't need states for username and password separately. We can just check socket.username
          socket.tempUsername = user.username;
          socket.state = config.STATES.LOGIN_PASSWORD;
          socket.emit('output', { message: 'Enter password:' });
        }
      });
    }
  },

  LoginPassword(socket, password, callback) {
    if (!socket.userId && (socket.state == config.STATES.LOGIN_PASSWORD)) {

      User.findOne({ username: socket.tempUsername, password: password.value })
        //.lean()
        //.populate('room')
        .exec(function (err, user) {
          if (err) return console.error(err);

          if (!user) {
            socket.emit('output', { message: 'Wrong password, please try again.' });
            return;
          }

          delete socket.tempUsername;

          // if the user is logged in from another connection, disconnect it.
          var existingSocket = socketUtil.getSocketByUsername(user.username);
          if (existingSocket) {
            existingSocket.emit('output', { message: 'You have logged in from another session.\n<span class="gray">*** Disconnected ***</span>' });
            existingSocket.disconnect();
          }

          // format the subdocuments so we have actual object instances
          // Note: tried a lean() query here, but that also stripped away the model
          // instance methods.
          const objInventory = user.inventory.map(i => i.toObject());
          user.inventory = objInventory;


          // THIS SHOULD BE THE ONLY USER STATE MANAGEMENT
          socket.user = user;

          // TODO: THIS CAN GO AWAY ONCE AN AUTH SYSTEM IS ADDED
          socket.state = config.STATES.MUD;

          socket.emit('output', { message: '<br>Welcome to CrucibleMUD!<br>' });

          socket.join('realm');
          socket.broadcast.to('realm').emit('output', { message: `${socket.user.username} has entered the realm.` });

          socket.join('gossip');

          hud.updateHUD(socket);

          const currentRoom = Room.getById(user.roomId);
          if (!currentRoom) {
            Room.byCoords({ x: 0, y: 0, z: 0 }, function (err, room) {
              socket.user.roomId = room.id;
              socket.join(room.id);
              if (callback) callback();
            });
          } else {
            socket.join(user.roomId);
            if (callback) callback();
          }
        });
    }
  },
};
