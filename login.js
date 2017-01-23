'use strict';

const globals = require('./globals');
module.exports = function (io) {
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

  function GetStartingRoom(socket, callback) {
    const roomsCollection = globals.DB.collection('rooms');
    roomsCollection.find({ _id: socket.roomId }).toArray((err, docs) => {
      if (docs.length == 0) {
        // if the user doesn't have a room saved (first login), default to starting room
        roomsCollection.find({ x: 0, y: 0, z: 0 }).toArray((err, docs) => {
          if (docs.length == 0) {
            console.log('No starting room found!');
            return;
          }
          callback(docs[0]);
        });
      } else {
        callback(docs[0]);
      }
    });
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
        const userCollection = globals.DB.collection('users');
        userCollection.find({ username: socket.tempUsername, password: password.value }).toArray((err, docs) => {
          if (docs.length == 0) {
            socket.emit('output', { message: 'Wrong password, please try again.' });
          } else {
            console.log('Successful password.');
            const error = CheckIfUserAlreadyLoggedIn(socket, socket.tempUsername);
            if (error) {
              return;
            }

            // todo: maybe we don't need states for username and password separately. We can just check socket.username
            delete socket.tempUsername;
            const user = docs[0];
            globals.USERNAMES[socket.id] = user.username;
            socket.userId = user._id;
            socket.admin = user.admin;
            socket.inventory = user.inventory || [];
            if (user.roomId) {
              socket.roomId = user.roomId;
            }
            socket.state = globals.STATES.MUD;


            socket.emit('output', { message: '<br>Welcome to CrucibleMUD!<br>' });

            // todo: currently these messages go to people who haven't even logged in... change that.
            socket.broadcast.emit('output', { message: `${globals.USERNAMES[socket.id]} has entered the realm.` });

            // lookup room data
            GetStartingRoom(socket, (room) => {
              socket.room = room;
              socket.join(socket.room._id);
              callback(socket);
            });
          }
        });
      }
    },
  };
};
