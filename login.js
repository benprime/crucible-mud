'use strict';

const globals = require('./globals');
const roomModel = require('./models/room');
const userModel = require('./models/user');

module.exports = function(io) {
  function CheckIfUserAlreadyLoggedIn(socket, username) {
    for (const socketId in io.sockets.sockets) {
      if (globals.USERNAMES[socketId] == username) {
        io.sockets.sockets[socketId].emit('output', { message: 'WARNING: Attempted logins to your account from another connection.' });
        socket.emit('output', { message: 'Already logged in from another connection.<br>Disconnected.' });
        socket.disconnect();
        return true;
      }
    }
    return false;
  }

  return {
    LoginUsername(socket, username) {
      if (!socket.userId && (socket.state == globals.STATES.LOGIN_USERNAME)) {
        const userCollection = globals.DB.collection('users');
        console.log(`Searching for user... ${JSON.stringify(username)}`);
        const userRegEx = new RegExp(`^${username.value}$`, 'i');
        userCollection.find({ username: userRegEx }).toArray((err, docs) => {
          if (docs.length == 0) {
            socket.emit('output', { message: 'Unknown user, please try again.' });
          } else {
            // todo: maybe we don't need states for username and password separately. We can just check socket.username
            socket.tempUsername = docs[0].username;
            socket.state = globals.STATES.LOGIN_PASSWORD;
            console.log('Successful username.');
            socket.emit('output', { message: 'Enter password:' });
          }
        });
      }
    },

    LoginPassword(socket, password, callback) {
      if (!socket.userId && (socket.state == globals.STATES.LOGIN_PASSWORD)) {

        userModel.findOne({ username: socket.tempUsername, password: password.value })
          .populate('room')
          .exec(function(err, user) {
            if (err) return console.error(err);

            if (!user) {
              socket.emit('output', { message: 'Wrong password, please try again.' });
              return;
            }

            console.log('Successful password.');

            // todo: this will get removed
            const error = CheckIfUserAlreadyLoggedIn(socket, socket.tempUsername);
            if (error) {
              return;
            }

            delete socket.tempUsername;
            globals.USERS[socket.id] = user;
            //globals.USERNAMES[socket.id] = user.username;

            socket.userId = user._id;
            socket.admin = user.admin;
            socket.inventory = user.inventory || [];



            socket.state = globals.STATES.MUD;
            socket.emit('output', { message: '<br>Welcome to CrucibleMUD!<br>' });

            // todo: currently these messages go to people who haven't even logged in... change that.
            socket.broadcast.emit('output', { message: `${globals.USERNAMES[socket.id]} has entered the realm.` });

            if (user.room) {
              socket.room = user.room;
              if (callback) callback(socket);
            } else {
              roomModel.byCoords(0, 0, 0, function(err, room) {
                socket.room = room;
                console.log(JSON.stringify(room));
                if (callback) callback(socket);
              });
            }
          });
      }
    },
  };
};
