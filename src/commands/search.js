'use strict';

const Room = require('../models/room');

module.exports = {
  name: 'search',

  patterns: [
    /^search$/i,
  ],

  dispatch(socket) {
    module.exports.execute(socket);
  },

  execute(socket) {
    const room = Room.getById(socket.user.roomId);
    let hExits, hItems;

    //search room item inventoy and room exits for anything hidden
    hExits = room.exits.filter(e => e.hidden);
    hItems = room.inventory.filter(i => i.hidden);

    //if nothing is hidden, return "You find nothing special."
    if(hExits.length < 1 && hItems < 1) {
      socket.emit('output', { message: 'You find nothing special.<br />' });
      return;
    }

    //if admin, skip to reveal
    if(!socket.user.admin) {

      //calculate player search skill

      //if skill+dice roll < all hidden DCs, return "You find nothing special.<br />"

      //cull lists down to only the hidden things with DC lower than skill roll


    }

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
    output += '<span class="mediumOrchid">search</span><span class="purple">-</span> If successful, reveal any hidden items and/or exits.<br />';
    socket.emit('output', { message: output });
  },

};
