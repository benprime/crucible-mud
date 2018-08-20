import socketUtil from './socketUtil';
import config from '../config';
import hud from './hud';
import Room from '../models/room';
import User from '../models/user';
import Character from '../models/character';

export default {
  LoginUsername(socket, { value }) {
    if (socket.state == config.STATES.LOGIN_USERNAME) {
      User.findByName(value, (err, user) => {
        if (!user) {
          socket.emit('output', { message: 'Unknown user, please try again.' });
        } else {
          socket.tempUsername = user.username;
          socket.state = config.STATES.LOGIN_PASSWORD;
          socket.emit('output', { message: 'Enter password:' });
        }
      });
    }
  },

  LoginPassword(socket, { value }, callback) {
    if (socket.state == config.STATES.LOGIN_PASSWORD) {

      User.findOne({ username: socket.tempUsername, password: value })
        .exec((err, user) => {
          if (err) return console.error(err);

          if (!user) {
            socket.emit('output', { message: 'Wrong password, please try again.' });
            return;
          }

          delete socket.tempUsername;

          // if the user is logged in from another connection, disconnect it.
          const existingSocket = socketUtil.getSocketByUsername(user.username);
          if (existingSocket) {
            existingSocket.emit('output', { message: 'You have logged in from another session.\n<span class="gray">*** Disconnected ***</span>' });
            existingSocket.disconnect();
          }
          socket.user = user;

          Character.findOne({ user: user }, (err, character) => {
            if(err) throw(err);
            if (!character) {
              throw 'No character associated with this user.';
            }

            socket.character = character;
            socket.character.offers = [];

            // format the subdocuments so we have actual object instances
            // Note: tried a lean() query here, but that also stripped away the model
            // instance methods.
            // TODO: is this still necessary?
            const objInventory = character.inventory.map(i => i.toObject());
            character.inventory = objInventory;

            // TODO: THIS CAN GO AWAY ONCE AN AUTH SYSTEM IS ADDED
            socket.state = config.STATES.MUD;

            socket.emit('output', { message: '<br>Welcome to CrucibleMUD!<br>' });

            socket.join('realm');
            socket.broadcast.to('realm').emit('output', { message: `${user.username} has entered the realm.` });

            socket.join('gossip');

            hud.updateHUD(socket);

            const currentRoom = Room.getById(character.roomId);
            if (!currentRoom) {
              Room.byCoords({ x: 0, y: 0, z: 0 }, (err, { id }) => {
                character.roomId = id;
                socket.join(id);
                if (callback) callback();
              });
            } else {
              socket.join(character.roomId);
              if (callback) callback();
            }
          });
        });
    }
  },
};
