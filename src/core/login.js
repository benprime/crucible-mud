import socketUtil from './socketUtil';
import config from '../config';
import hud from './hud';
import Room from '../models/room';
import User from '../models/user';
import Character from '../models/character';

export default {
  LoginUsername(socket, { value }) {
    if (socket.state == config.STATES.LOGIN_USERNAME) {
      Character.findByName(value).then(character => {
        if (!character) {
          socket.emit('output', { message: 'Unknown user, please try again.' });
        } else {
          socket.tempEmail = character.user.email;
          socket.state = config.STATES.LOGIN_PASSWORD;
          socket.emit('output', { message: 'Enter password:' });
        }
      }).catch(err => {
        socket.emit('output', { message: `Error: ${err}` });
      });
    }
  },

  LoginPassword(socket, { value }) {
    if (socket.state == config.STATES.LOGIN_PASSWORD) {

      return User.findOne({ email: socket.tempEmail, password: value }).then(user => {
        if (!user) {
          return Promise.reject('Wrong password, please try again.');
        }

        delete socket.tempEmail;

        return Character.findByUser(user).then(character => {
          // if the user is logged in from another connection, disconnect it.
          const existingSocket = socketUtil.getSocketByCharacterId(character.id);
          if (existingSocket) {
            existingSocket.emit('output', { message: 'You have logged in from another session.\n<span class="gray">*** Disconnected ***</span>' });
            existingSocket.disconnect();
          }
          socket.user = user;

          return Character.findOne({ user: user }).then(character => {
            if (!character) {
              return Promise.reject('No character associated with this user.');
            }

            // databse objects
            socket.character = character;
            socket.character.user = user;

            // state tracking
            socket.character.offers = [];
            socket.character.sneakMode = 0;
            socket.character.bleeding = false;
            socket.character.attackInterval = undefined;
            socket.character.lastAttack = undefined;
            socket.character.attackTarget = undefined;
            socket.character.leader = null;

            // once character is loaded, we freeze the ability to add new properties.
            // this forces "state properties" to be added here, explicitly.
            Object.preventExtensions(socket.character);

            // format the subdocuments so we have actual object instances
            // Note: tried a lean() query here, but that also stripped away the model
            // instance methods.
            // TODO: is this still necessary?
            const objInventory = character.inventory.map(i => i.toObject());
            character.inventory = objInventory;

            // TODO: THIS CAN GO AWAY ONCE AN AUTH SYSTEM IS ADDED
            socket.state = config.STATES.MUD;

            socket.emit('output', { message: '<br><span class="mediumOrchid">Welcome to CrucibleMUD!</span><br>' });

            socket.join('realm');
            socket.broadcast.to('realm').emit('output', { message: `<span class="mediumOrchid">${character.name} has entered the realm.</span>\n` });

            socket.join('gossip');

            hud.updateHUD(socket);

            const currentRoom = Room.getById(character.roomId);
            if (!currentRoom) {
              return Room.getByCoords({ x: 0, y: 0, z: 0 }).then(room => {
                character.roomId = room.id;
                socket.join(room.id);
                return Promise.resolve();
              });
            } else {
              socket.join(character.roomId);
              return Promise.resolve();
            }
          });

        });

      });
    }
  },
};
