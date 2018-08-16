'use strict';

import Room from '../models/room';
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
    const room = Room.getById(socket.user.roomId);
    let hExits, hItems, totalHidden;
    let roomDC = 4; //base difficulty of rooms to reveal hidden things

    //search room item inventory and room exits for anything hidden
    hExits = room.exits.filter(e => e.hidden);
    hItems = room.inventory.filter(i => i.hidden);
    totalHidden = hExits.length + hItems.length;

    //if admin, skip to reveal
    if (!socket.user.admin) {

      //calculate player search skill
      let stealthRoll = socket.user.stealth + dice.roll(socket.user.actionDie);
      socket.emit('output', { message: `Search Roll: ${stealthRoll}<br />` });

      //if nothing is hidden, return "You find nothing special."
      if (hExits.length < 1 && hItems.length < 1) {
        socket.emit('output', { message: 'You find nothing special.<br />' });
        return;
      }

      //if skill+dice roll < all hidden DCs, return "You find nothing special.<br />"
      if (stealthRoll < roomDC) {
        socket.emit('output', { message: 'You find nothing special.<br />' });
        return;
      }

      //cull lists down to only the hidden things with DC lower than skill roll
      if (stealthRoll < roomDC + totalHidden) {
        //only reveal a selection of the hidden things
      }

    }
    else socket.emit('output', { message: 'Stealth Roll: admin<br />' });

    //reveal remaining things
    hExits.forEach(element => element.hidden = false);
    hItems.forEach(element => element.hidden = false);
    room.save();

    //tell player that they found something
    socket.emit('output', { message: 'You have spotted something!<br />' });

    //either set a reveal timer or make sure revealed things become hidden again after player leaves area

    //figure out how other players in room can see the revealed things and tell them accordingly


  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">stealth</span><span class="purple">-</span> If successful, move without alerting others in room.<br />';
    socket.emit('output', { message: output });
  },

};
