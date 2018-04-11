'use strict';

const mocks = require('../spec/mocks');
const sut = require('../commands/set');
const Room = require('../models/room');

describe('set', function () {
  let socket;
  let room;

  beforeAll(function () {
    room = mocks.getMockRoom();
    spyOn(Room, 'getById').and.callFake(() => room);
    socket = new mocks.SocketMock();
  });

  beforeEach(function() {
    socket.reset();
  });

  describe('execute', function () {

    describe('when type is room', function() {
      it('should return error when property not in allowed properties list', function() {
        sut.execute(socket, 'room', 'bad property', 'new value');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Invalid property.' });
      });

      it('should update room in room cache and room database object on success', function() {
        sut.execute(socket, 'room', 'name', 'new name value');

        expect(room.name).toBe('new name value');
        expect(room.save).toHaveBeenCalled();
        expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser has altered the fabric of reality.' });
      });
    });

    it('should return error when type is not room', function() {
      sut.execute(socket, 'bad type', 'some property', 'new value');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Invalid type.' });
    });
  });

});