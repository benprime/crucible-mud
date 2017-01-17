var globals = require('./globals');
// Base round will be 4000 millseconds.
// An average dexterity character, with an "average" weapon will attack every 4 seconds.


// mob checks will be hit every 500 millseconds? to check if they should be attacking again...

// seems hacky, dunno if I should be doing this... but save current mobs on the socketio room objects.
// if server crashes, or is stopped, mobs will disappear and be reinitialized... but that's fine.
// this allows for the update loop to just spin through existing rooms in memory, and not have to hit mongo
// for each combat frame. Not that we need it, but we could run the combat at 30fps.

// spawn checks have to hit mongo... they can run at a much slower framerate (every 10 seconds or something).
var MSG_COLOR = 'darkcyan';
var DMG_COLOR = 'red';


module.exports = function(io) {
  setInterval(function() {
    // check all players...
    for (var socketId in io.sockets.connected) {
      // if socket is a logged in user
      var username = globals.USERNAMES[socketId];
      if (username) {
        var socket = io.sockets.connected[socketId];
        // if socket is in combat
        var now = Date.now();
        if (socket.attackInterval && (!socket.lastAttack || socket.lastAttack + socket.attackInterval <= now)) {
          socket.lastAttack = now;
          socket.emit("output", { message: "<span class=\"" + MSG_COLOR + "\">You attack nothing!</span>" });
        }
        //console.log(username);
        //console.log(socket.attackInterval);
        //console.log(socket.lastAttack);
        //console.log('-------------------------');
      }

    }

    // check all mobs!
  }, 500);
  return {};
}
