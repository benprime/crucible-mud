import socketUtil from './socketUtil';
import config from '../config';
import hud from './hud';
import Room from '../models/room';
import User from '../models/user';

export default {
  LoginUsername(socket, {value}) {
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

  LoginPassword(socket, {value}, callback) {
    if (socket.state == config.STATES.LOGIN_PASSWORD) {

      User.findOne({ username: socket.tempUsername, password: value })
        //.lean()
        //.populate('room')
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

          // format the subdocuments so we have actual object instances
          // Note: tried a lean() query here, but that also stripped away the model
          // instance methods.
          const objInventory = user.inventory.map(i => i.toObject());
          user.inventory = objInventory;


          // THIS SHOULD BE THE ONLY USER STATE MANAGEMENT
          socket.user = user;

          // TODO: THIS CAN GO AWAY ONCE AN AUTH SYSTEM IS ADDED
          socket.state = config.STATES.MUD;

          socket.emit('output', { message: '<br>Welcome to CrucibleMUD!<br>' });

          socket.join('realm');
          socket.broadcast.to('realm').emit('output', { message: `${socket.user.username} has entered the realm.` });

          socket.join('gossip');

          hud.updateHUD(socket);

          const currentRoom = Room.getById(user.roomId);
          if (!currentRoom) {
            Room.byCoords({ x: 0, y: 0, z: 0 }, (err, {id}) => {
              socket.user.roomId = id;
              socket.join(id);
              if (callback) callback();
            });
          } else {
            socket.join(user.roomId);
            if (callback) callback();
          }
        });
    }
  },
};
