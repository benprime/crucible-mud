import Room from '../../../models/room';
import socketUtil from '../../../core/socketUtil';
import {getDirection} from '../../../core/directions';

export default {
  name: 'yell',
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

    return true;
  },
};
