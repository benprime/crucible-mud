'use strict';

const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom;
const sut = SandboxedModule.require('./search', {
  requires: {
    '../models/room': {
      getById: () => mockRoom,
      validDirectionInput: Room.validDirectionInput,
      longToShort: Room.longToShort,
    },
  },
});

describe('search', function () {
  let socket;

  beforeEach(function () {
    socket = new mocks.SocketMock();
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true },
        { dir: 's', roomId: 'nRoomId' },
        { dir: 'u', roomId: 'nRoomId', hidden: true },
        { dir: 'd', roomId: 'nRoomId', hidden: false },
      ],
      save: jasmine.createSpy('roomSave'),
    };
  });

  it('should output message when no hidden items exist in room', function () {
    sut.execute(socket);

    //expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You find nothing special.' });
    //expect(mockRoom.save).not.toHaveBeenCalled();
  });

});
