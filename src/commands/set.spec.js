'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom = mocks.getMockRoom();
const sut = SandboxedModule.require('./set', {
  requires: {
    '../models/room': {
      getById: jasmine.createSpy('getByIdSpy').and.callFake(() => mockRoom),
    },
    './look': {
      execute: jasmine.createSpy('lookCommandSpy'),
    },
  },
});

describe('set', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => {
    socket.reset();
  });

  describe('execute', () => {

    describe('when type is room', () => {
      it('should return error when property not in allowed properties list', () => {
        sut.execute(socket, 'room', 'bad property', 'new value');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Invalid property.' });
      });

      it('should update room in room cache and room database object on success', () => {
        sut.execute(socket, 'room', 'name', 'new name value');

        expect(mockRoom.name).toBe('new name value');
        expect(mockRoom.save).toHaveBeenCalled();
        expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser has altered the fabric of reality.' });
      });
    });

    it('should return error when type is not room', () => {
      sut.execute(socket, 'bad type', 'some property', 'new value');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Invalid type.' });
    });
  });

});
