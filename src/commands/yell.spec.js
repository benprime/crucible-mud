'use strict';

const Room = require('../models/room');
const mocks = require('../../spec/mocks');

const SandboxedModule = require('sandboxed-module');

const room = mocks.getMockRoom();
const sut = SandboxedModule.require('./yell', {
  requires: {
    '../models/room': {
      getById: () => room,
      oppositeDirection: Room.oppositeDirection,
      shortToLong: Room.shortToLong,
    },
  },
});

describe('yell', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    socket.user.roomId = room.id;

    const msg = 'This is a yelled message!';
    sut.execute(socket, msg);
  });

  describe('execute', function () {

    it('should send message to actioning player', function () {
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You yell \'This is a yelled message!\'' });
    });

    it('should send message to local rooms', function () {
      expect(socket.broadcast.to(room._id).emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} yells 'This is a yelled message!'` });
    });

    it('should send message to surrounding rooms', function () {
      expect(socket.broadcast.to(room.roomIds.u).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from below  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.d).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from above  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.n).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the south  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.s).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the north  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.e).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the west  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.w).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the east  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.ne).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the southwest  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.se).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the northwest  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.nw).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the southeast  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(room.roomIds.sw).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the northeast  \'This is a yelled message!\'' });
    });

  });
});
