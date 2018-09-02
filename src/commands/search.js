import Room from '../models/room';
import dice from '../core/dice';
import commandCategories from '../core/commandCategories';

export default {
  name: 'search',
  desc: 'search the current room for hidden objects',
  category: commandCategories.item,

  patterns: [
    /^search$/i,
  ],

  dispatch(socket) {
    return this.execute(socket.character);
  },

  execute(character) {
    const room = Room.getById(character.roomId);
    let hExits, hItems, totalHidden;
    let roomDC = 4; //base difficulty of rooms to reveal hidden things

    //search room item inventory and room exits for anything hidden
    hExits = room.exits.filter(e => e.hidden);
    hItems = room.inventory.filter(i => i.hidden);
    totalHidden = hExits.length + hItems.length;

    let output = '';

    //if admin, skip to reveal
    if (!character.user.admin) {

      //calculate player search skill
      let diceResult = dice.roll(character.actionDie);
      let searchRoll = diceResult + character.skills.search;

      output += `Search Roll: ${searchRoll}<br />`;

      //if nothing is hidden, return "You find nothing special."
      if (hExits.length < 1 && hItems.length < 1) {
        output += 'You find nothing special.<br />';
        character.output(output);
        return Promise.resolve();
      }

      //if skill+dice roll < all hidden DCs, return "You find nothing special.<br />"
      if (searchRoll < roomDC) {
        output += 'You find nothing special.<br />';
        character.output(output);
        return Promise.resolve();
      }

      //cull lists down to only the hidden things with DC lower than skill roll
      if (searchRoll < roomDC + totalHidden) {
        //only reveal a selection of the hidden things
      }

    }

    //reveal remaining things
    hExits.forEach(element => element.hidden = false);
    hItems.forEach(element => element.hidden = false);
    room.save(err => { if (err) throw err; });

    //tell player that they found something
    output += 'You have spotted something!<br />';
    character.output(output);
    return Promise.resolve();

    //either set a reveal timer or make sure revealed things become hidden again after player leaves area

    //figure out how other players in room can see the revealed things and tell them accordingly


  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">search</span><span class="purple">-</span> If successful, reveal any hidden items and/or exits.<br />';
    character.output(output);
  },

};
