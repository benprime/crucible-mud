'use strict';

import dice from '../core/dice';

export default {
  name: 'sneak',

  patterns: [
    /^sneak$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {

    //if admin, skip to auto sneak
    if (!socket.user.admin) {

      //calculate player stealth skill
      let stealthRoll = socket.user.stealth + dice.roll(socket.user.actionDie);
      socket.user.sneak = stealthRoll;
      socket.emit('output', { message: `Sneak Roll: ${stealthRoll}<br />` });

    }
    else {
      socket.user.sneak = 100;
      socket.emit('output', { message: 'Sneak Roll: admin<br />' });
    }

    socket.user.save(err => { if (err) throw err; });

  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">sneak</span><span class="purple">-</span> Activates a sneak bonus for the following stealth-based commands: move<br />';
    socket.emit('output', { message: output });
  },

};
