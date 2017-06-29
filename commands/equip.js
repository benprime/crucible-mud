'use strict';

module.exports = {
  name: 'equip',

  patterns: [
    /^eq$/i,
    /^equip$/i,
    /^equip\s+(.+)$/i
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1], match[2]);
  },

  execute(socket, itemName, hand) {
    //check user.inventory for itemName
    // autocomplete name
    const itemNames = socket.user.inventory.map(i => i.displayName);
    const completedNames = global.AutocompleteName(socket, itemName, itemNames);
    if (completedNames.length === 0) {
      socket.emit('output', { message: 'You don\'t have that item in your inventory.\n' });
      return;
    } else if (completedNames.length > 1) {
      // todo: possibly print out a list of the matches
      socket.emit('output', { message: 'Not specific enough!\n' });
      return;
    }

    const item = socket.user.inventory.find(it => it.displayName === completedNames[0]);
    console.log(item);

    //if no match emit "itemName is not in your inventory" and return
    if (!item.equip) {
      socket.emit('output', { message: 'You cannot equip that!\n' });
      return;
    }
    else {
      //if match add itemName to appropriate character item slot
      switch (item.equip) {
        case "":
          break;
        case "mainHand":
          socket.user.equipSlots.weaponMain = item.id;
        case "offHand":
          socket.user.equipSlots.weaponOff = item.id;
        case "bothHand":
          socket.user.equipSlots.weaponMain = item.id;
          socket.user.equipSlots.weaponOff = item.id;
        case "eitherHand":
          if (hand == "main") {
            socket.user.equipSlots.weaponMain = item.id;
          }
          else if (hand == "off") {
            socket.user.equipSlots.weaponOff = item.id;
          }
          else {
            socket.emit('output', { message: 'Please specify which hand to equip the item\n' });
          }
        case "head":
          socket.user.equipSlots.head = item.id;
        case "body":
          socket.user.equipSlots.body = item.id;
        case "legs":
          socket.user.equipSlots.legs = item.id;
        case "feet":
          socket.user.equipSlots.feet = item.id;
        case "arms":
          socket.user.equipSlots.arms = item.id;
        case "hands":
          socket.user.equipSlots.hands = item.id;
        case "neck":
          socket.user.equipSlots.neck = item.id;
        case "finger":
          if (hand == "main") {
            socket.user.equipSlots.fingerMain = item.id;
          }
          else if (hand == "off") {
            socket.user.equipSlots.fingerOff = item.id;
          }
          else {
            socket.emit('output', { message: 'Please specify which hand to equip the item\n' });
          }
        default:
        socket.emit('output', { message: 'Um, you want to put that where?!?!\n'});
      }
      //add bonuses from itemName to corresponding character stats


    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon, specify main/off to equip to one hand or the other (if able).<br />';
    socket.emit('output', { message: output });
  },
};
