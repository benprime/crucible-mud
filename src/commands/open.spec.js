const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom = mocks.getMockRoom();
const sut = SandboxedModule.require('./open', {
  requires: {
    '../models/room': {
      getById: () => mockRoom,
      shortToLong: Room.shortToLong,
      validDirectionInput: Room.validDirectionInput,
      longToShort: Room.longToShort,
    },
  },
});

describe('open', () => {
  let socket;

  beforeAll(() => {
    mockRoom = {
      inventory: [],
      mobs: [],
      exits: [
        { dir: 'n', roomId: 'nRoomId', closed: true },
        { dir: 's', roomId: 'sRoomId', closed: false },
        { dir: 'e', roomId: 'eRoomId', keyName: 'someKey', locked: true, closed: true },
        { dir: 'w', roomId: 'wRoomId', keyName: 'someKey', locked: false, closed: false },
        { dir: 'se', roomId: 'seRoomId', keyName: 'someKey', locked: false, closed: true },
        { dir: 'sw', roomId: 'swRoomId' },
      ],
    };
  });

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    it('should output message when direction is invalid', () => {
      sut.execute(socket, 'ne');

      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'There is no exit in that direction!' });
    });

    it('should output message when direction has no door', () => {
      sut.execute(socket, 'sw');
      const exit = mockRoom.exits.find(e => e.dir === 'sw');

      expect(exit.hasOwnProperty('closed')).toBe(false);
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'There is no door in that direction!' });
    });

    describe('when key is associated', () => {
      it('should fail and output message when door is locked and closed', () => {
        sut.execute(socket, 'e');
        const exit = mockRoom.exits.find(e => e.dir === 'e');

        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(true);
        expect(exit.closed).toBe(true);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That door is locked.' });
      });

      it('should succeed and output message when door is unlocked and closed', () => {
        sut.execute(socket, 'se');
        const exit = mockRoom.exits.find(e => e.dir === 'se');

        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(false);
        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser opens the door to the southeast.' });
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door opened.' });
      });

      it('should send messages when door and is unlocked and open', () => {
        sut.execute(socket, 'w');
        const exit = mockRoom.exits.find(e => e.dir === 'w');

        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(false);
        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That door is already open.' });
      });
    });

    describe('when no key is associated', () => {
      it('should output message when door is closed', () => {
        sut.execute(socket, 'n');
        const exit = mockRoom.exits.find(e => e.dir === 'n');

        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser opens the door to the north.' });
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door opened.' });
      });

      it('should output message when door and is open', () => {
        sut.execute(socket, 's');
        const exit = mockRoom.exits.find(e => e.dir === 's');

        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That door is already open.' });
      });
    });


  });
});
