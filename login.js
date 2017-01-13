var globals = require('./globals');

module.exports = {
  LoginUsername: function(socket, username) {
    if (!socket.userId && (socket.state == globals.STATES.LOGIN_USERNAME)) {
      var userCollection = globals.DB.collection('users');
      console.log("Searching for user... " + JSON.stringify(username));
      userCollection.find({ username: username.value }).toArray(function(err, docs) {
        if (docs.length == 0) {
          socket.emit('output', { message: "Unknown user, please try again." });
        } else {
          // todo: maybe we don't need states for username and password separately. We can just check socket.username
          console.log(JSON.stringify(docs));
          //socket.username = docs[0].username;
          globals.USERNAMES[socket.id] = docs[0].username;
          socket.state = globals.STATES.LOGIN_PASSWORD;
          console.log("Successful username.");
          socket.emit('output', { message: "Enter password:" });
        }
      });

    }
  },

  LoginPassword: function(socket, password, callback) {
    if (!socket.userId && (socket.state == globals.STATES.LOGIN_PASSWORD)) {

      var userCollection = globals.DB.collection('users');
      userCollection.find({ username: globals.USERNAMES[socket.id], password: password.value }).toArray(function(err, docs) {
        if (docs.length == 0) {
          socket.emit('output', { message: "Wrong password, please try again." });
        } else {
          // todo: maybe we don't need states for username and password separately. We can just check socket.username
          socket.userId = docs[0]._id;
          socket.admin = docs[0].admin;
          //socket.username = docs[0].username;
          socket.state = globals.STATES.MUD;
          console.log("Successful password.");

          // todo: currently these messages go to people who haven't even logged in... change that.
          socket.broadcast.emit('output', { message: globals.USERNAMES[socket.id] + ' has entered the realm.' });

          // lookup room data
          // TODO: THIS IS STILL JUST GETTING THE FIRST ROOM IN THE COLLECTION
          var roomsCollection = globals.DB.collection('rooms');
          roomsCollection.find({}).toArray(function(err, docs) {
            socket.room = docs[0];
            socket.join(socket.room._id)
            socket.emit('output', { message: "" }); // just forcing a blank line
            callback(socket);
            //console.log("joined room: " + socket.room._id);
          });

        }
      });

    }
  }
}
