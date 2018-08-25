import actionsData from '../data/actionData';
import utils from '../core/utilities';
import autocomplete from '../core/autocomplete';

export default {
  isValidAction(action) {
    return action.toLowerCase() in actionsData.actions;
  },

  actionDispatcher(character, action, username) {
    // autocomplete username
    let targetCharacter = character;
    if (username) {
      targetCharacter = autocomplete.character(character, username);
      if (!targetCharacter) {
        return Promise.reject(`Unknwon player: ${username}`);
      }
    }

    // make sure the user is someone in the room
    if (targetCharacter.id !== character.id && targetCharacter.roomId !== character.roomId) {
      return Promise.reject(`You don't see ${username} anywhere!`);
    }

    const selfAction = targetCharacter.id === character.id;

    // determine message set to use
    const actionMessages = actionsData.actions[action];
    if (!actionMessages) {
      return Promise.reject(`No emote data found for emote: ${action}!`);
    }
    const messageSet = selfAction ? actionMessages.solo : actionMessages.target;

    const fromUserName = character.name;
    const toUserName = !selfAction ? targetCharacter.name : null;

    const charMessages = [];
    const roomMessages = [];

    // messages to action-taker
    if (messageSet.sourceMessage) {
      charMessages.push({ charId: character.id, message: utils.formatMessage(messageSet.sourceMessage, fromUserName, toUserName) });
    }

    // messages to all bystanders
    if (messageSet.roomMessage) {

      const exclude = [];
      // if you have a sourceMessage, don't send "room message" to source socket
      if (messageSet.sourceMessage) {
        exclude.push(character.id);
      }

      // not to target user's socket (since they have their own message)
      if (!selfAction && messageSet.targetMessage) {
        exclude.push(targetCharacter.id);
      }
      roomMessages.push({ roomId: character.roomId, message: utils.formatMessage(messageSet.roomMessage, fromUserName, toUserName), exclude: exclude });
    }

    // message to target user
    if (!selfAction && messageSet.targetMessage) {
      charMessages.push({ charId: targetCharacter.id, message: utils.formatMessage(messageSet.targetMessage, fromUserName, toUserName) });
    }

    return Promise.resolve({
      roomMessages: roomMessages,
      charMessages: charMessages,
    });
  },
};
