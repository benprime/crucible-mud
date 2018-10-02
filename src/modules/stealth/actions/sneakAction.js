'use strict';

import dice from '../../../core/dice';
import characterStates from '../../../core/characterStates';

export default {
  name: 'sneak',
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

    return true;
  },
};
