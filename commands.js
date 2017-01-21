var dirUtil = require('./direction');
var globals = require('./globals');
var actionData = require('./data/actionData');

// adding prototype method to object... need to move this to more global libary
function getKeyByValue(obj, value) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop] === value)
        return prop;
    }
  }
}

module.exports = function(io) {
  var adminUtil = require('./admin')(io);
  var actions = require('./actions')(io);
  var items = require('./items')(io);
  var combat = require('./combat')(io);

  function GetSocketByUsername(username) {
    var socketId = getKeyByValue(globals.USERNAMES, username);
    return io.sockets.connected[socketId];
  }

  function Teleport(socket, username, callback) {
    var userSocket = GetSocketByUsername(username);
    if (!userSocket) {
      socket.emit('output', { message: 'Player not found.' });
      return;
    }

    socket.leave(socket.room._id);
    socket.join(userSocket.room._id);
    socket.room = userSocket.room;
    if (callback) callback();
  }

  function Who(socket) {

    var usernames = [];
    for (var socketId in io.sockets.sockets) {
      if (globals.USERNAMES[socketId]) {
        usernames.push(globals.USERNAMES[socketId]);
      }
    }

    var output = '<span class="cyan"> -=- ' + usernames.length + ' Players Online -=-</span><br />';
    output += '<div class="mediumOrchid">' + usernames.join('<br />') + '</div>';
    socket.emit('output', { message: output });
  }

  function Inventory(socket) {
    var output = '<span class="cyan">You are carrying: </span>';
    output += '<span class="silver">';
    output += socket.inventory.length > 0 ? socket.inventory.map(function(item) {
      return item.name
    }).join(', ') : "Nothing.";
    output += '</span>';
    socket.emit('output', { message: output });
  }

  // emits "You hear movement to the <dir>" to all adjacent rooms
  function MovementSounds(socket, fromRoomId) {
    // todo: hrmm, check if the room exists in socket io first?
    // could save processing time... since we don't need to write to sockets if
    // no one is in those rooms...
    socket.room.exits.map(function(door) {
      if (door.roomId.toString() == fromRoomId.toString()) {
        return;
      }
      var message = '';
      if (door.dir == "u") {
        message = "You hear movement from below.";
      } else if (door.dir == "d") {
        message = "You hear movement from above.";
      } else {
        message = "You hear movement to the " + dirUtil.ExitName(dirUtil.OppositeDirection(door.dir)) + '.';
      }

      socket.broadcast.to(door.roomId).emit('output', { message: message });
    });
  }

  function Telepathy(socket, data) {
    var re = /\/(\w+)\s+(.+)/
    var tokens = data.match(re);
    if (tokens && tokens.length > 2) {
      var username = tokens[1];
      var message = tokens[2];

      var userSocket = GetSocketByUsername(username);
      if (!userSocket) {
        socket.emit('output', { 'message': 'Invalid username.' });
        return;
      }
      var sender = globals.USERNAMES[socket.id];

      // why doesn't this work? Trying to get the propert casing.
      //var receiver = globals.USERNAMES[userSocket];

      userSocket.emit('output', { 'message': sender + ' telepaths: ' + message });
      socket.emit('output', { 'message': 'Telepath to ' + username + ': ' + message });
    } else {
      socket.emit('output', { 'message': 'Usage: /&lt;username&gt; &lt;message&gt;' });
    }
  }

  function UsersInRoom(socket) {
    if (!socket.room._id in io.sockets.adapter.rooms) {
      return [];
    }
    var clients = io.sockets.adapter.rooms[socket.room._id].sockets;

    // remove current user
    var otherUsers = Object.keys(clients).filter(function(socketId) {
      return socketId != socket.id;
    });

    var usernames = otherUsers.map(function(socketId) {
      return globals.USERNAMES[socketId];
    });
    return usernames;
  }

  function CommandDispatch(socket, inputData) {

    var input = inputData.value.trim();

    // if first character is a period, just say string
    if (input.substr(0, 1) === ".") {
      Say(socket, input.substr(1));
      return;
    }

    if (input.substr(0, 1) === "/") {
      Telepathy(socket, input);
      return;
    }

    // inventory as a separate check here, to stop people from
    // having and inventory happen on every statement they start
    // with I, ie: "i was doing something"
    if (input.toLowerCase() === "i") {
      Inventory(socket);
      return;
    }

    // split on whitespace
    var command = input.split(/\s+/);
    var action = command[0].toLowerCase();

    if (actions.actionDispatcher(socket, action, command.length > 1 ? command[1] : null)) {
      return;
    }

    // on blank command string, just look.
    if (command.length == 1 && action == '') {
      Look(socket, true);
      return;
    }

    if (dirUtil.ValidDirectionInput(action)) {
      Move(socket, action);
      return;
    }

    switch (action) {
      case 'h':
      case '?':
      case 'help':
        Help(socket);
        break;
      case 'inv':
      case 'inventory':
        Inventory(socket);
        break;
      case 'take':
        items.TakeItem(socket, input.replace(/^take\s+/i, ''), function() {
          //Look(socket);
        });
        break;
      case 'get':
        items.TakeItem(socket, input.replace(/^get\s+/i, ''), function() {
          //Look(socket);
        });
        break;
      case 'drop':
        items.DropItem(socket, input.replace(/^drop\s+/i, ''), function() {
          //Look(socket);
        });
        break;
      case 'l':
      case 'look':
        Look(socket);
        break;
      case 'attack':
        combat.Attack(socket, input.replace(/^attack\s+/i, '').trim().toLowerCase());
        break;
      case 'break':
        combat.Break(socket);
        break;
      case 'gossip':
      case 'gos':
        Gossip(socket, input.replace(/^gossip\s+/i, '').replace(/^gos\s+/i, ''));
        break;
      case 'who':
        Who(socket);
        break;

        // ---- ADMIN COMMANDS ----        
      case 'create':
        if (socket.admin) {
          adminUtil.CreateDispatch(socket, command, input, function() {
            Look(socket);
          });
        }
        break;
      case 'set':
        if (socket.admin) {
          adminUtil.SetDispatch(socket, command, input, function() {
            Look(socket);
          });
        }
        break;
      case 'teleport':
        if (socket.admin) {
          if (command.length < 2) {
            socket.emit('output', { message: 'Teleport to who?' });
            return;
          }
          Teleport(socket, command[1], function() {
            socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' appears out of thin air!' });
            Look(socket);
          });
        }
        break;
      case 'spawn':
        adminUtil.Spawn(socket, command[1], function() {
          Look(socket);
        });
        break;
        // ---- END ADMIN COMMANDS ----

      default:
        Say(socket, input);
    }
  }

  function Say(socket, message) {
    message = message.replace(/</g, '&lt;');
    message = message.replace(/>/g, '&gt;');

    // to sending socket
    socket.emit('output', { message: 'You say "' + message + '"' });

    // everyone else
    socket.broadcast.to(socket.room._id).emit('output', { message: globals.USERNAMES[socket.id] + ' says "' + message + '"' });
  }

  function Gossip(socket, message) {
    message = message.replace(/</g, '&lt;');
    message = message.replace(/>/g, '&gt;');

    var output = '<span class="silver">' + globals.USERNAMES[socket.id] + ' gossips: </span><span class="mediumOrchid">' + message + '</span>';
    io.emit('output', { message: output });
  }

  function HitWall(socket, dir) {
    var message = '';

    // send message to everyone in current room that player is running into stuff.
    if (dir == "u") {
      message = globals.USERNAMES[socket.id] + ' runs into the ceiling.';
    } else if (dir == "d") {
      message = globals.USERNAMES[socket.id] + ' runs into the floor.';
    } else {
      message = globals.USERNAMES[socket.id] + ' runs into the wall to the ' + dirUtil.ExitName(dir) + '.';
    }
    socket.broadcast.to(socket.room._id).emit('output', { message: '<span class="silver">' + message + '</span>' });
    socket.emit('output', { message: "There is no exit in that direction!" });
  }

  function Move(socket, dir) {
    dir = dir.toLowerCase();

    // changes "north" to "n" (just returns "n" if that's what's passed in)
    dir = dirUtil.LongToShort(dir);

    // valid exit in that direction?
    var door = socket.room.exits.find(door => door.dir === dir);
    if (!door) {
      HitWall(socket, dir);
      return;
    }

    var roomsCollection = globals.DB.collection('rooms');
    roomsCollection.find({ _id: door.roomId }).toArray(function(err, docs) {
      var message = '';
      if (docs.length == 0) {
        // hrmm if the exit was just validated, this should never happen.
        HitWall(socket, dir);
        console.log("WARNING: Query couldn't find next room when going through a door.")
        return;
      }

      // send message to everyone in old room that player is leaving
      if (dir == "u") {
        message = globals.USERNAMES[socket.id] + ' has gone above.';
      } else if (dir == "d") {
        message = globals.USERNAMES[socket.id] + ' has gone below.';
      } else {
        message = globals.USERNAMES[socket.id] + ' has left to the ' + dirUtil.ExitName(dir) + '.';
      }
      socket.broadcast.to(socket.room._id).emit('output', { message: message });
      var fromRoomId = socket.room._id;
      socket.leave(socket.room._id);

      // update user session
      socket.room = docs[0];
      socket.join(socket.room._id);

      // update mongodb
      globals.DB.collection('users').update({ _id: socket.userId }, { $set: { "roomId": socket.room._id } });

      MovementSounds(socket, fromRoomId);

      // send message to everyone is new room that player has arrived
      if (dir == "u") {
        message = globals.USERNAMES[socket.id] + ' has entered from below.';
      } else if (dir == "d") {
        message = globals.USERNAMES[socket.id] + ' has entered from above.';
      } else {
        message = globals.USERNAMES[socket.id] + ' has entered from the ' + dirUtil.ExitName(dirUtil.OppositeDirection(dir)) + '.';
      }
      socket.broadcast.to(socket.room._id).emit('output', { message: message });

      // You have moved south...
      socket.emit('output', { message: dirUtil.Feedback(dir) });
      Look(socket);
    });

  }

  function Help(socket) {
    var output = '';
    output += '<span class="cyan">Movement:</span><br>';
    output += '<span class="mediumOrchid">n<span class="purple"> | </span>north</span> <span class="purple">-</span> Move north.<br />';
    output += '<span class="mediumOrchid">s<span class="purple"> | </span>south</span> <span class="purple">-</span> Move south.<br />';
    output += '<span class="mediumOrchid">e<span class="purple"> | </span>east</span> <span class="purple">-</span> Move east.<br />';
    output += '<span class="mediumOrchid">w<span class="purple"> | </span>west</span> <span class="purple">-</span> Move west.<br />';
    output += '<span class="mediumOrchid">ne<span class="purple"> | </span>northeast</span> <span class="purple">-</span> Move northeast.<br />';
    output += '<span class="mediumOrchid">se<span class="purple"> | </span>southeast</span> <span class="purple">-</span> Move southeast.<br />';
    output += '<span class="mediumOrchid">nw<span class="purple"> | </span>northwest</span> <span class="purple">-</span> Move northwest.<br />';
    output += '<span class="mediumOrchid">sw<span class="purple"> | </span>southwest</span> <span class="purple">-</span> Move southwest.<br />';
    output += '<span class="mediumOrchid">u<span class="purple"> | </span>up</span> <span class="purple">-</span> Move up.<br />';
    output += '<span class="mediumOrchid">d<span class="purple"> | </span>down</span> <span class="purple">-</span> Move down.<br /><br />';

    output += '<span class="cyan">Commands:</span><br>';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look</span> <span class="purple">-</span> Look at current room.<br />';
    output += '<span class="mediumOrchid">who</span> <span class="purple">-</span> List all online players.<br /><br>';

    output += '<span class="cyan">Communication:</span><br>';
    output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Start command with . to speak to users in current room.<br />';
    output += '<span class="mediumOrchid">/&lt;username&gt; <message></span> <span class="purple">-</span> Send message directly to a single player.<br />';
    output += '<span class="mediumOrchid">gossip &lt;message&gt;</span> <span class="purple">-</span> Send messages to all connected players.<br />';

    output += '<br><span class="cyan">Actions:</span><br />';
    output += '<span class="silver">' + Object.keys(actionData.actions).sort().join('<span class="mediumOrchid">, </span>') + '</span><br /></br />';

    if (socket.admin) {
      output += '<span class="cyan">Admin commands:</span><br />';
      output += '<span class="mediumOrchid">create room &lt;dir&gt;</span><br />';
      output += '<span class="mediumOrchid">set room name &lt;new room name&gt;</span><br />';
      output += '<span class="mediumOrchid">set room desc &lt;new room desc&gt;</span><br />';
      output += '<span class="mediumOrchid">create item &lt;item name&gt;</span><br />';
      output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><br />';
    }
    socket.emit('output', { message: output });
  }

  function Look(socket, short) {
    var exits = socket.room.exits || [];
    var inventory = socket.room.inventory || [];

    var output = '<span class="cyan">' + socket.room.name + '</span>\n';

    if (!short) {
      output += '<span class="silver">' + socket.room.desc + '</span>\n';
    }

    if (inventory.length > 0) {
      output += '<span class="darkcyan">You notice: ' + inventory.map(function(item) {
        return item.name;
      }).join(', ') + '.</span>\n';
    }

    var names = UsersInRoom(socket);

    var mobInRoom = globals.MOBS[socket.room._id] || [];
    var mobNames = mobInRoom.map(function(mob) {
      return mob.displayName
    });
    console.log("names: " + JSON.stringify(names));
    console.log("mobNames: " + JSON.stringify(mobNames));
    if (mobNames) { names = names.concat(mobNames); }
    var displayNames = names.join('<span class="mediumOrchid">, </span>');

    if (displayNames) {
      output += '<span class="purple">Also here: <span class="teal">' + displayNames + '</span>.</span>\n';
    }

    if (exits.length > 0) {
      output += '<span class="green">Exits: ' + exits.map(function(door) {
        return dirUtil.ExitName(door.dir);
      }).join(', ') + '</span>\n';
    }

    socket.emit("output", { message: output });
  }

  // public functions
  return {
    CommandDispatch: CommandDispatch,
    Look: Look
  }
}
