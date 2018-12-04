import login from '../../../core/login';
import socketUtil from '../../../core/socketUtil';

export default {
  name: 'logout',
  execute(character) {

    let socket = socketUtil.getSocketByCharacterId(character.id);
    login.logout(socket);
  },

};
