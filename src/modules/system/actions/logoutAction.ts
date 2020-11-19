import authentication from '../../../core/authentication';
import socketUtil from '../../../core/socketUtil';

export default {
  name: 'logout',
  execute(character) {

    let socket = socketUtil.getSocketByCharacterId(character.id);
    authentication.logout(socket);
  },

};
