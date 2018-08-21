import actionsData from '../data/actionData';
import Room from '../models/room';
import utils from '../core/utilities';
import autocomplete from '../core/autocomplete';

export default {
  actionDispatcher(character, action, username) {

    // validate action
    if (!(action in actionsData.actions)) return Promise.reject('invalid action');

    // autocomplete username
    let targetCharacter = character;
    if (username) {
      targetCharacter = autocomplete.character(character, username);
      if (!targetCharacter) {
        return Promise.reject(`Unknwon player: ${username}`);
      }
    }

    // make sure the user is someone in the room
    if (targetCharacter.id !== character.id) {
      const room = Room.getById(character.roomId);
      const userInRoom = room.userInRoom(targetCharacter.name);
      if (!userInRoom) {
        return Promise.reject(`You don't see ${username} anywhere!`);
      }
    }

    const selfAction = targetCharacter.id === character.id;

    // determine message set to use
    const actionMessages = actionsData.actions[action];
    const messageSet = selfAction ? actionMessages.solo : actionMessages.target;

    const fromUserName = character.name;
    const toUserName = !selfAction ? targetCharacter.name : null;

    const charMessages = [];

    // messages to action-taker
    if (messageSet.sourceMessage) {
      charMessages.push({ charId: character.id, message: utils.formatMessage(messageSet.sourceMessage, fromUserName, toUserName) });
    }

    // messages to all bystanders
    if (messageSet.roomMessage) {
      const socketRoom = global.io.sockets.adapter.rooms[character.roomId];

      for (let toChar of Object.values(socketRoom.sockets).map(s => s.character)) {
        // if you have a sourceMessage, don't send "room message" to source socket
        if (messageSet.sourceMessage && character.id === toChar.id) {
          continue;
        }

        // not to target user's socket (since they have their own message)
        if (!selfAction && messageSet.targetMessage && toChar.id === targetCharacter.id) {
          continue;
        }
        charMessages.push({ charId: toChar.id, message: utils.formatMessage(messageSet.roomMessage, fromUserName, toUserName) });
      }
    }

    // message to target user
    if (!selfAction && messageSet.targetMessage) {
      charMessages.push({ charId: targetCharacter.id, message: utils.formatMessage(messageSet.targetMessage, fromUserName, toUserName) });
    }

    return Promise.resolve({
      charMessages: charMessages,
    });
  },
};
