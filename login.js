'use strict';

const roomModel = require('./models/room');
//const roomManager = require('./roomManager');
const userModel = require('./models/user');

module.exports = {
  LoginUsername(socket, username) {
    if (!socket.userId && (socket.state == global.STATES.LOGIN_USERNAME)) {
      userModel.findByName(username.value, function(err, user) {
        console.log(`Searching for user... ${JSON.stringify(username)}`);
        if (!user) {
          socket.emit('output', { message: 'Unknown user, please try again.' });
        } else {
          // todo: maybe we don't need states for username and password separately. We can just check socket.username
          socket.tempUsername = user.username;
          socket.state = global.STATES.LOGIN_PASSWORD;
          console.log('Successful username.');
          socket.emit('output', { message: 'Enter password:' });
        }
      });
    }
  },

  LoginPassword(socket, password, callback) {
    if (!socket.userId && (socket.state == global.STATES.LOGIN_PASSWORD)) {

      userModel.findOne({ username: socket.tempUsername, password: password.value })
        //.populate('room')
        .exec(function(err, user) {
          if (err) return console.error(err);

          if (!user) {
            socket.emit('output', { message: 'Wrong password, please try again.' });
            return;
          }

          console.log('Successful password.');

          delete socket.tempUsername;

          // THIS SHOULD BE THE ONLY USER STATE MANAGEMENT
          socket.user = user;


          // TODO: THIS CAN GO AWAY ONCE AN AUTH SYSTEM IS ADDED
          socket.state = global.STATES.MUD;


          socket.emit('output', { message: '<br>Welcome to CrucibleMUD!<br>' });

          // todo: currently these messages go to people who haven't even logged in... change that.
          socket.broadcast.emit('output', { message: `${socket.user.username} has entered the realm.` });

          // todo: maybe this should check if the roomId currently exists.
          if (!user.roomId) {
            roomModel.byCoords({ x: 0, y: 0, z: 0 }, function(err, room) {
              console.log("Default room", room);
              socket.user.roomId = room.id;
              socket.join(room.id);
              console.log(JSON.stringify(room));
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
