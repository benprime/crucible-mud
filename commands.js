'use strict';

const globals = require('./globals');
const dirUtil = require('./direction');
const actionData = require('./data/actionData');

module.exports = function CommandExports(io) {
  const adminUtil = require('./admin')(io);
  const actions = require('./actions')(io);
  const items = require('./items')(io);
  const combat = require('./combat')(io);

  function Teleport(socket, username, callback) {
    const userSocket = globals.GetSocketByUsername(io, username);
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
    const usernames = [];

    Object.keys(io.sockets.sockets).forEach((socketId) => {
      // check if user logged in
      if (globals.USERNAMES[socketId]) {
        usernames.push(globals.USERNAMES[socketId]);
      }
    });

    let output = `<span class="cyan"> -=- ${usernames.length} Players Online -=-</span><br />`;
    output += `<div class="mediumOrchid">${usernames.join('<br />')}</div>`;
    socket.emit('output', { message: output });
  }

  function Inventory(socket) {
    console.log(socket.inventory);
    const inv = socket.inventory || [];
    let invOutput = inv.map(item => item.name).join(', ');
    console.log(invOutput);
    if (!invOutput) {
      invOutput = 'Nothing.';
    }

    let output = '<span class="cyan">You are carrying: </span>';
    output += '<span class="silver">';
    output += invOutput;
    output += '</span>';
    socket.emit('output', { message: output });
  }

  // emits "You hear movement to the <dir>" to all adjacent rooms
  function MovementSounds(socket, excludeDir) {
    // todo: hrmm, check if the room exists in socket io first?
    // I think the room doesn't exist in socket io if no one is currently joined to it.
    // could save processing time... since we don't need to write to sockets if
    // no one is in those rooms...

    // todo: currently not sending sounds to fromRoom or toRoom,
    // since those rooms get the standard "leaving" and "entering"
    // messages. This may change when sneaking is implemented.

    // fromRoomId is your current room (before move)
    socket.room.exits.forEach((door) => {
      /*
      if (door.roomId.toString() === fromRoomId.toString()) {
        return;
      }
      */

      if (excludeDir && door.dir === excludeDir) {
        return;
      }

      let message = '';
      if (door.dir === 'u') {
        message = 'You hear movement from below.';
      } else if (door.dir === 'd') {
        message = 'You hear movement from above.';
      } else {
        message = `You hear movement to the ${dirUtil.ExitName(dirUtil.OppositeDirection(door.dir))}.`;
      }

      // ES6 object literal shorthand syntax... message here becomes message: message
      socket.broadcast.to(door.roomId).emit('output', { message });
    });
  }

  function Yell(socket, message) {
    socket.room.exits.forEach((door) => {
      let preMsg = '';
      if (door.dir === 'u') {
        preMsg = 'Someone yells from below ';
      } else if (door.dir === 'd') {
        preMsg = 'Someone yells from above ';
      } else {
        preMsg = `Someone yells from the ${dirUtil.ExitName(dirUtil.OppositeDirection(door.dir))} `;
      }

      var surroundMsg = `${preMsg} "${message}"`;

      socket.broadcast.to(door.roomId).emit('output', { message: surroundMsg });
    });


    socket.emit('output', { message: `You yell "${message}"` });
    socket.broadcast.to(socket.room._id).emit('output', { message: `You yell "${message}"` });
  }

  function Telepathy(socket, data) {
    const re = /\/(\w+)\s+(.+)/;
    const tokens = data.match(re);
    if (tokens && tokens.length > 2) {
      const username = tokens[1];
      const message = tokens[2];

      const userSocket = globals.GetSocketByUsername(io, username);
      if (!userSocket) {
        socket.emit('output', { message: 'Invalid username.' });
        return;
      }
      const sender = globals.USERNAMES[socket.id];

      userSocket.emit('output', { message: `${sender} telepaths: ${message}` });
      socket.emit('output', { message: `Telepath to ${username}: ${message}` });
    } else {
      socket.emit('output', { message: 'Usage: /&lt;username&gt; &lt;message&gt;' });
    }
  }

  function UsersInRoom(socket) {
    if (!(socket.room._id in io.sockets.adapter.rooms)) {
      return [];
    }
    const clients = io.sockets.adapter.rooms[socket.room._id].sockets;

    // remove current user
    const otherUsers = Object.keys(clients).filter(socketId => socketId !== socket.id);

    const usernames = otherUsers.map(socketId => globals.USERNAMES[socketId]);
    return usernames;
  }


  function Say(socket, message) {
    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    // to sending socket
    socket.emit('output', { message: `You say "${safeMessage}"` });

    // everyone else
    socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} says "${safeMessage}"` });
  }

  function Gossip(socket, message) {
    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    const output = `<span class="silver">${globals.USERNAMES[socket.id]} gossips: </span><span class="mediumOrchid">${safeMessage}</span>`;
    io.emit('output', { message: output });
  }

  function HitWall(socket, dir) {
    let message = '';

    // send message to everyone in current room that player is running into stuff.
    if (dir === 'u') {
      message = `${globals.USERNAMES[socket.id]} runs into the ceiling.`;
    } else if (dir === 'd') {
      message = `${globals.USERNAMES[socket.id]} runs into the floor.`;
    } else {
      message = `${globals.USERNAMES[socket.id]} runs into the wall to the ${dirUtil.ExitName(dir)}.`;
    }
    socket.broadcast.to(socket.room._id).emit('output', { message: `<span class="silver">${message}</span>` });
    socket.emit('output', { message: 'There is no exit in that direction!' });
  }

  function Move(socket, dir) {
    let d = dir.toLowerCase();

    // changes "north" to "n" (just returns "n" if that's what's passed in)
    d = dirUtil.LongToShort(d);

    // valid exit in that direction?
    const door = socket.room.exits.find(exitDoor => exitDoor.dir === d);
    if (!door) {
      HitWall(socket, d);
      return;
    }

    const roomsCollection = globals.DB.collection('rooms');
    roomsCollection.find({ _id: door.roomId }).toArray((err, docs) => {
      let message = '';
      if (docs.length === 0) {
        // hrmm if the exit was just validated, this should never happen.
        HitWall(socket, dir);
        console.log("WARNING: Query couldn't find next room when going through a door.");
        return;
      }

      // send message to everyone in old room that player is leaving
      if (dir === 'u') {
        message = `${globals.USERNAMES[socket.id]} has gone above.`;
      } else if (dir === 'd') {
        message = `${globals.USERNAMES[socket.id]} has gone below.`;
      } else {
        message = `${globals.USERNAMES[socket.id]} has left to the ${dirUtil.ExitName(dir)}.`;
      }

      // stop mobs attacking this user (since he is leaving the room)
      combat.Break(socket);
      combat.MobDisengage(socket);

      socket.broadcast.to(socket.room._id).emit('output', { message });
      MovementSounds(socket, d);
      socket.leave(socket.room._id);

      // update user session
      socket.room = docs[0];
      socket.join(socket.room._id);
      MovementSounds(socket, dirUtil.OppositeDirection(d));

      // update mongodb
      globals.DB.collection('users').update({ _id: socket.userId }, { $set: { roomId: socket.room._id } });



      // send message to everyone is new room that player has arrived
      if (dir === 'u') {
        message = `${globals.USERNAMES[socket.id]} has entered from below.`;
      } else if (dir === 'd') {
        message = `${globals.USERNAMES[socket.id]} has entered from above.`;
      } else {
        message = `${globals.USERNAMES[socket.id]} has entered from the ${dirUtil.ExitName(dirUtil.OppositeDirection(dir))}.`;
      }
      socket.broadcast.to(socket.room._id).emit('output', { message });

      // You have moved south...
      socket.emit('output', { message: dirUtil.Feedback(dir) });
      Look(socket);
    });
  }

  function Help(socket) {
    let output = '';
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

    output += '<span class="cyan">Combat:</span><br>';
    output += '<span class="mediumOrchid">attack <span class="purple">|</span> a</span> <span class="purple">-</span> attack &lt;target&gt;<br />';
    output += '<span class="mediumOrchid">break <span class="purple">|</span> br</span> <span class="purple">-</span> Break off current attack.<br /><br>';

    output += '<span class="cyan">Communication:</span><br>';
    output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Start command with . to speak to users in current room.<br />';
    output += '<span class="mediumOrchid">"<message></span> <span class="purple">-</span> Yell to this room and all adjacent rooms.<br />';
    output += '<span class="mediumOrchid">/&lt;username&gt; <message></span> <span class="purple">-</span> Send message directly to a single player.<br />';
    output += '<span class="mediumOrchid">gossip &lt;message&gt;</span> <span class="purple">-</span> Send messages to all connected players.<br />';

    output += '<br><span class="cyan">Actions:</span><br />';
    output += `<span class="silver">${Object.keys(actionData.actions).sort().join('<span class="mediumOrchid">, </span>')}</span><br /></br />`;

    if (socket.admin) {
      output += '<span class="cyan">Admin commands:</span><br />';
      output += '<span class="mediumOrchid">create room &lt;dir&gt;</span><br />';
      output += '<span class="mediumOrchid">set room name &lt;new room name&gt;</span><br />';
      output += '<span class="mediumOrchid">set room desc &lt;new room desc&gt;</span><br />';
      output += '<span class="mediumOrchid">create item &lt;item name&gt;</span><br />';
      output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><br />';
      output += '<span class="mediumOrchid">list - list mob catalog</span><br />';
      output += '<span class="mediumOrchid">spawn <mobType> - spawn &lt;mobType&gt;</span><br />';
    }
    socket.emit('output', { message: output });
  }

  function Look(socket, short) {
    const exits = socket.room.exits || [];
    const inventory = socket.room.inventory || [];

    let output = `<span class="cyan">${socket.room.name}</span>\n`;

    if (!short) {
      output += `<span class="silver">${socket.room.desc}</span>\n`;
    }

    if (inventory.length > 0) {
      output += `<span class="darkcyan">You notice: ${inventory.map(item => item.name).join(', ')}.</span>\n`;
    }

    let names = UsersInRoom(socket);

    const mobInRoom = globals.MOBS[socket.room._id] || [];
    const mobNames = mobInRoom.map(mob => mob.displayName);
    console.log(`names: ${JSON.stringify(names)}`);
    console.log(`mobNames: ${JSON.stringify(mobNames)}`);
    if (mobNames) { names = names.concat(mobNames); }
    const displayNames = names.join('<span class="mediumOrchid">, </span>');

    if (displayNames) {
      output += `<span class="purple">Also here: <span class="teal">${displayNames}</span>.</span>\n`;
    }

    if (exits.length > 0) {
      output += `<span class="green">Exits: ${exits.map(door => dirUtil.ExitName(door.dir)).join(', ')}</span>\n`;
    }

    socket.emit('output', { message: output });
  }

  function CommandDispatch(socket, inputData) {
    const input = inputData.value.trim();

    // if first character is a period, just say string
    if (input.substr(0, 1) === '.') {
      Say(socket, input.substr(1));
      return;
    }

    if (input.substr(0, 1) === '"') {
      Yell(socket, input.replace(/^"?(.+?)"?$/, '$1'));
      return;
    }

    if (input.substr(0, 1) === '/') {
      Telepathy(socket, input);
      return;
    }

    // inventory as a separate check here, to stop people from
    // having and inventory happen on every statement they start
    // with I, ie: "i was doing something"
    if (input.toLowerCase() === 'i') {
      Inventory(socket);
      return;
    }

    // split on whitespace
    const command = input.split(/\s+/);
    const action = command[0].toLowerCase();

    if (actions.actionDispatcher(socket, action, command.length > 1 ? command[1] : null)) {
      return;
    }

    // on blank command string, just look.
    if (command.length === 1 && action === '') {
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
        items.TakeItem(socket, input.replace(/^take\s+/i, ''), () => {
          // Look(socket);
        });
        break;
      case 'get':
        items.TakeItem(socket, input.replace(/^get\s+/i, ''), () => {
          // Look(socket);
        });
        break;
      case 'drop':
        items.DropItem(socket, input.replace(/^drop\s+/i, ''), () => {
          // Look(socket);
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
          adminUtil.CreateDispatch(socket, command, input, () => {
            Look(socket);
          });
        }
        break;
      case 'destroy':
        if (socket.admin) {
          adminUtil.DestroyDispatch(socket, command, input, () => {
            Look(socket);
          });
        }
        break;
      case 'set':
        if (socket.admin) {
          adminUtil.SetDispatch(socket, command, input, () => {
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
          Teleport(socket, command[1], () => {
            socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} appears out of thin air!` });
            Look(socket);
          });
        }
        break;
      case 'spawn':
        adminUtil.Spawn(socket, command[1], () => {
          Look(socket);
        });
        break;
      case 'list':
        adminUtil.ListMobs(socket);
        break;
        // ---- END ADMIN COMMANDS ----

      default:
        Say(socket, input);
    }
  }

  // public functions
  return {
    CommandDispatch,
    Look,
  };
};
