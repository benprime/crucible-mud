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

    const index = socket.user.inventory.findIndex(it => it.displayName === completedNames[0]);
    const item = socket.user.inventory.splice(index, 1)[0];
    socket.user.save();
    console.log(item);
    


    //if no match emit "itemName is not in your inventory" and return
    if (!item.equip) {
      socket.emit('output', { message: 'You cannot equip that!\n' });
      return;
    }
    else {






        //TODO: equip the objects themselves into the slots, not the object ID








      //if match add itemName to appropriate character item slot
      switch (item.equip) {
        case "":
          break;
        case "mainHand":
          socket.user.equipSlots.weaponMain = item.id;
          break;
        case "offHand":
          socket.user.equipSlots.weaponOff = item.id;
          break;
        case "bothHand":
          socket.user.equipSlots.weaponMain = item.id;
          socket.user.equipSlots.weaponOff = item.id;
          break;
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
          break;
        case "head":
          socket.user.equipSlots.head = item.id;
          break;
        case "body":
          socket.user.equipSlots.body = item.id;
          break;
        case "legs":
          socket.user.equipSlots.legs = item.id;
          break;
        case "feet":
          socket.user.equipSlots.feet = item.id;
          break;
        case "arms":
          socket.user.equipSlots.arms = item.id;
          break;
        case "hands":
          socket.user.equipSlots.hands = item.id;
          break;
        case "neck":
          socket.user.equipSlots.neck = item.id;
          break;
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
          break;
        default:
        socket.emit('output', { message: 'Um, you want to put that where?!?!\n'});
      }
        socket.emit('output', { message: 'Item equipped.\n'});


      //add bonuses from itemName to corresponding character stats


    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon, specify main/off to equip to one hand or the other (if able).<br />';
    socket.emit('output', { message: output });
  },
};
