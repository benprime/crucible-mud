'use strict';

import Room from '../models/room';
import dice from '../core/dice';

export default {
  name: 'search',

  patterns: [
    /^search$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {
    const room = Room.getById(socket.character.roomId);
    let hExits, hItems, totalHidden;
    let roomDC = 4; //base difficulty of rooms to reveal hidden things

    //search room item inventory and room exits for anything hidden
    hExits = room.exits.filter(e => e.hidden);
    hItems = room.inventory.filter(i => i.hidden);
    totalHidden = hExits.length + hItems.length;

    //if admin, skip to reveal
    if (!socket.user.admin) {

      //calculate player search skill
      let searchRoll = socket.character.skills.search + dice.roll(socket.character.actionDie);
      socket.emit('output', { message: `Search Roll: ${searchRoll}<br />` });

      //if nothing is hidden, return "You find nothing special."
      if (hExits.length < 1 && hItems.length < 1) {
        socket.emit('output', { message: 'You find nothing special.<br />' });
        return;
      }

      //if skill+dice roll < all hidden DCs, return "You find nothing special.<br />"
      if (searchRoll < roomDC) {
        socket.emit('output', { message: 'You find nothing special.<br />' });
        return;
      }

      //cull lists down to only the hidden things with DC lower than skill roll
      if (searchRoll < roomDC + totalHidden) {
        //only reveal a selection of the hidden things
      }

    }
    else socket.emit('output', { message: 'Search Roll: admin<br />' });

    //reveal remaining things
    hExits.forEach(element => element.hidden = false);
    hItems.forEach(element => element.hidden = false);
    room.save(err => { if (err) throw err; });

    //tell player that they found something
    socket.emit('output', { message: 'You have spotted something!<br />' });

    //either set a reveal timer or make sure revealed things become hidden again after player leaves area

    //figure out how other players in room can see the revealed things and tell them accordingly


  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">search</span><span class="purple">-</span> If successful, reveal any hidden items and/or exits.<br />';
    socket.emit('output', { message: output });
  },

};
