'use strict';

const Room = require('../models/room');
const mocks = require('../../mocks');
const sut = require('../commands/open');

describe('open', function () {
  let socket;
  let room;

  beforeAll(function () {
    room = {
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
    spyOn(Room, 'getById').and.callFake(() => room);
  });

  beforeEach(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should output message when direction is invalid', function () {
      sut.execute(socket, 'ne');
      
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'There is no exit in that direction!' });
    });

    it('should output message when direction has no door', function () {
      sut.execute(socket, 'sw');
      const exit = room.exits.find(e => e.dir === 'sw');
      
      expect(exit.hasOwnProperty('closed')).toBe(false);
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'There is no door in that direction!' });
    });

    describe('when key is associated', function () {
      it('should fail and output message when door is locked and closed', function () {
        sut.execute(socket, 'e');
        const exit = room.exits.find(e => e.dir === 'e');
        
        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(true);
        expect(exit.closed).toBe(true);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That door is locked.' });
      });

      it('should succeed and output message when door is unlocked and closed', function () {
        sut.execute(socket, 'se');
        const exit = room.exits.find(e => e.dir === 'se');
        
        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(false);
        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser opens the door to the southeast.' });
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door opened.' });
      });

      it('should send messages when door and is unlocked and open', function () {
        sut.execute(socket, 'w');
        const exit = room.exits.find(e => e.dir === 'w');
        
        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(false);
        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That door is already open.' });
      });
    });

    describe('when no key is associated', function () {
      it('should output message when door is closed', function () {
        sut.execute(socket, 'n');
        const exit = room.exits.find(e => e.dir === 'n');
        
        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser opens the door to the north.' });
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door opened.' });
      });

      it('should output message when door and is open', function () {
        sut.execute(socket, 's');
        const exit = room.exits.find(e => e.dir === 's');
        
        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That door is already open.' });
      });
    });


  });
});