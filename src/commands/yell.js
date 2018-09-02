import Room from '../models/room';
import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';
import {getDirection} from '../core/directions';

export default {
  name: 'yell',
  desc: 'shout a message to current and all adjacent rooms',
  category: commandCategories.communication,

  patterns: [
    /^"(.+)"?/,
    /^yell\s+(.+)/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1]);
  },

  execute(character, message) {

    const room = Room.getById(character.roomId);

    // send message to all adjacent exits
    room.exits.forEach(exit => {
      let preMsg = '';
      if (exit.dir === 'u') {
        preMsg = 'Someone yells from below ';
      } else if (exit.dir === 'd') {
        preMsg = 'Someone yells from above ';
      } else {
        let dir = getDirection(exit.dir);
        preMsg = `Someone yells from the ${dir.opposite.long} `;
      }
      const surroundMsg = `${preMsg} '${message}'`;
      socketUtil.roomMessage(exit.roomId, surroundMsg);
    });

    socketUtil.roomMessage(room.id, `${character.name} yells '${message}'`, [character.id]);
    character.output(`You yell '${message}'`);

    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">yell command</span><br/>';
    output += '<span class="mediumOrchid">"<message></span> <span class="purple">-</span> Yell to this room and all adjacent rooms.<br />';
    character.output(output);
  },
};
