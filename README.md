# CrucibleMUD
CrucibleMUD is a web socket framework for creating massively multiplayer text-based games.

Necessary environment variables:
NODE_PORT=3000
MONGO_DB=mud
MONGO_PORT=27017

An example command object:
```C#
{
  name: 'scream',

  // the ways your command can be entered
  patterns: [
    /^scream\s+(\w+)$/i,
    /^scream$/i,
  ],

  // Dispatch exists so you can inspect your parsed parameters and
  // perhaps do some additional processing on them before calling
  // the command's logic.
  dispatch(socket, match) {

    if(match[1] == "bloody murder") {
      console.log("Someone is screaming bloody murder on your server.");
    }

    // call the command
    module.exports.execute(socket, match[1]);
  },

  // core logic of command
  execute(socket, message) {
    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} is screaming his head off!`});
  },

  // printed when someone types 'help scream'
  help(socket) {
    socket.emit('output', { message: 'Usage: scream <message>' });
  },
}
```
