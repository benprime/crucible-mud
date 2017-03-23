'use strict';

module.exports = {
  name: "spawn",

  patterns: [
    /^spawn\s+?(\w)/i
  ],

  dispatch(socket, match) {},

  execute(socket, match) {

    if (!socket.admin) return;

    if (!mobTypeName) {
      socket.emit('output', { message: 'Must pass mob type.' });
      return;
    }

    const createType = mobData.catalog.find(mob => mob.name.toLowerCase() === mobTypeName.toLowerCase());

    if (!createType) {
      socket.emit('output', { message: 'Unknown mob type.' });
      return;
    }

    if (!globals.MOBS[socket.room._id]) globals.MOBS[socket.room._id] = [];

    // clone the create type and give it an id
    var mobInstance = Object.assign({ _id: new ObjectId().toString() }, createType);

    globals.MOBS[socket.room._id].push(mobInstance);
    //console.log(JSON.stringify(globals.MOBS[socket.room._id]));
    socket.emit('output', { message: 'Summoning successful.' });
    socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} waves his hand and a ${createType.displayName} appears!` });

    if (callback) callback();

  },

  help() {},
}
