var dirUtil = require('./direction');
var globals = require('./globals');

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

  function UsersInRoom(socket) {
    var clients = io.sockets.adapter.rooms[socket.room._id].sockets;

    // remove current user
    var otherUsers = Object.keys(clients).filter(function(socketId) {
      return socketId != socket.id;
    });

    var usernames = otherUsers.map(function(socketId) {
      return globals.USERNAMES[socketId];
    });
    return usernames.join('<span class="mediumOrchid">, </span>');
  }

  function CommandDispatch(socket, data) {

    // if first character is a period, just say string
    if (data.value.substr(0, 1) === ".") {
      Say(socket, data.value.substr(1));
      return;
    }

    if (data.value.toLowerCase() === "i") {
      Inventory(socket);
      return;
    }

    // split on whitespace
    var command = data.value.split(/\s+/);
    var action = command[0].toLowerCase();

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
      case 'l':
      case 'look':
        Look(socket);
      case 'attack':
        break;
      case 'create':
        if (socket.admin) {
          adminUtil.CreateDispatch(socket, command, data.value, function() {
            Look(socket);
          });
        }
        break;
      case 'set':
        if (socket.admin) {
          adminUtil.SetDispatch(socket, command, data.value, function() {
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
      case 'gossip':
      case 'gos':
        Gossip(socket, data.value.replace(/^gossip/i, '').replace(/^gos/i, ''));
        break;
      case 'who':
        Who(socket);
        break;
      default:
        Say(socket, data.value);
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

  function Move(socket, dir) {
    dir = dir.toLowerCase();
    dir = dirUtil.LongToShort(dir);
    var roomsCollection = globals.DB.collection('rooms');
    roomsCollection.find({ _id: socket.room.exits[dir] }).toArray(function(err, docs) {
      if (docs.length == 0) {
        var message = '';
        
        // send message to everyone in current room that player is running into stuff.
        if (dir == "u") {
          message = globals.USERNAMES[socket.id] + ' runs into the ceiling.';
        } else if (dir == "d") {
          message = globals.USERNAMES[socket.id] + ' runs into the floor';
        } else {
          message = globals.USERNAMES[socket.id] + ' runs into the wall to the ' + dirUtil.ExitName(dir);
        }
        socket.broadcast.to(socket.room._id).emit('output', { message: '<span class="silver">' + message + '.</span>' });
        socket.emit('output', { message: "There is no exit in that direction!" });
        return;
      }

      // send message to everyone in old room that player is leaving
      if (dir == "u") {
        message = globals.USERNAMES[socket.id] + ' has gone above.';
      } else if (dir == "d") {
        message = globals.USERNAMES[socket.id] + ' has gone below.';
      } else {
        message = globals.USERNAMES[socket.id] + ' has left to the ' + dirUtil.ExitName(dir);
      }

      socket.broadcast.to(socket.room._id).emit('output', { message: +'.' });
      socket.leave(socket.room._id);

      socket.room = docs[0];
      socket.join(socket.room._id);

      // send message to everyone is new room that player has arrived
      if (dir == "u") {
        message = globals.USERNAMES[socket.id] + ' has entered from above.';
      } else if (dir == "d") {
        message = globals.USERNAMES[socket.id] + ' has entered from below.';
      } else {
        message = globals.USERNAMES[socket.id] + ' has entered from the ' + dirUtil.ExitName(dirUtil.OppositeDirection(dir)) + '.';
      }
      socket.broadcast.to(socket.room._id).emit('output', { message: message });

      socket.emit('output', { message: dirUtil.Feedback(dir) });
      Look(socket);
    });

  }

  function Help(socket) {
    var output = '<pre><span class="cyan">Commands:</span><br />';
    output += '  <span class="mediumOrchid">Movement</span> <span class="purple">-</span> n,s,e,w,u,d,ne,nw,sw,se<br />';
    output += '      <span class="mediumOrchid">look</span> <span class="purple">-</span> Look at current room.<br />';
    output += '    <span class="mediumOrchid">gossip</span> <span class="purple">-</span> Send messages to all connected players.<br />';
    output += '       <span class="mediumOrchid">who</span> <span class="purple">-</span> List all online players.<br />';
    output += '       <span class="mediumOrchid">say</span> <span class="purple">-</span> Send messages to players in current room.<br />';
    output += '             Note: starting any command with . will say that command.<br />';
    output += '</pre>';

    if (socket.admin) {
      output += '<pre><span class="cyan">Admin commands:</span><br />';
      output += '  <span class="mediumOrchid">create room &lt;dir&gt;</span><br />';
      output += '  <span class="mediumOrchid">set room name &lt;new room name&gt;</span><br />';
      output += '  <span class="mediumOrchid">set room desc &lt;new room desc&gt;</span><br />';
      output += '  <span class="mediumOrchid">create item &lt;item name&gt;</span><br />';
      output += '  <span class="mediumOrchid">teleport &lt;username&gt;</span><br /></pre>';
    }
    socket.emit('output', { message: output });
  }

  function Look(socket, short) {
    var exits = socket.room.exits || {};

    var output = '<span class="cyan">' + socket.room.name + '</span>\n';

    if (!short) {
      output += '<span class="silver">' + socket.room.desc + '</span>\n';
    }

    var otherUsers = UsersInRoom(socket);
    if (otherUsers) {
      output += '<span class="purple">Also here: <span class="teal">' + otherUsers + '</span>.</span>\n';
    }

    if (Object.keys(exits).length > 0) {
      output += '<span class="green">Exits: ' + Object.keys(exits).map(function(dir) {
        return dirUtil.ExitName(dir)
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
