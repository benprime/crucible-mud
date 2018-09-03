'use strict';

import dice from '../core/dice';
import characterStates from '../core/characterStates';
import commandCategories from '../core/commandCategories';

export default {
  name: 'sneak',
  desc: 'Activates stealthy movement.',
  category: commandCategories.stealth,

  patterns: [
    /^sneak$/i,
    /^sn$/i,
  ],

  dispatch(socket) {
    return this.execute(socket.character);
  },

  execute(character) {

    //if admin, skip to auto sneak
    if (!character.user.admin) {
      //calculate player stealth skill
      let stealthRoll = character.skills.stealth + dice.roll(character.actionDie);
      //character.sneakMode = stealthRoll;
      character.output(`Sneak Roll: ${stealthRoll}<br />`);
    }
    else {
      //character.sneakMode = 100;
      character.output('Sneak Roll: admin<br />');
    }

    // for now we'll just put them into sneak mode
    character.setState(characterStates.SNEAKING);

    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">sneak</span><span class="purple">-</span> Activates a sneak bonus for the following stealth-based commands: move<br />';
    character.output(output);
  },

};
