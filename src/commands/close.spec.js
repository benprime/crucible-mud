'use strict';

const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockGlobalIO = new mocks.IOMock();
let mockRoom;
const sut = SandboxedModule.require('./close', {
  requires: {
    '../models/room': {
      getById: () => mockRoom,
      validDirectionInput: Room.validDirectionInput,
      longToShort: Room.longToShort,
      shortToLong: Room.shortToLong,
    },
  },
  globals: {io:mockGlobalIO},
});

describe('close', function () {
  let socket;

  describe('execute', function () {

    beforeEach(function () {
      socket = new mocks.SocketMock();
      mockRoom = {
        id: socket.user.roomId,
        inventory: [],
        mobs: [],
        exits: [
          { dir: 'n', roomId: 'nRoomId', closed: true },
          { dir: 's', roomId: 'sRoomId', closed: false },
          { dir: 'e', roomId: 'eRoomId' },
          { dir: 'w', roomId: 'wRoomId' },
        ],
      };
    });

    it('should print message on invalid direction', function () {
      sut.execute(socket, 'ne');

      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'There is no exit in that direction!' });

    });

    it('should print message when no door exists in valid direction', function () {
      sut.execute(socket, 'e');
      const exit = mockRoom.exits.find(e => e.dir === 'e');

      expect(exit.hasOwnProperty('closed')).toBe(false);
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'There is no door in that direction!' });
    });

    it('should be succesful when door is open', function () {
      sut.execute(socket, 's');
      const exit = mockRoom.exits.find(e => e.dir === 's');

      expect(exit.closed).toBe(true);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser closes the door to the south.' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door closed.' });
    });

    it('should be succesful when door is already closed', function () {
      sut.execute(socket, 'n');
      const exit = mockRoom.exits.find(e => e.dir === 'n');

      expect(exit.closed).toBe(true);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser closes the door to the north.' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door closed.' });
    });

  });

});
