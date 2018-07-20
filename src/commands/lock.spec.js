'use strict';

const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom;
let autocompleteResult;
const sut = SandboxedModule.require('./lock', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompleteTypesSpy').and.callFake(() => autocompleteResult),
    },
    '../models/room': {
      getById: () => mockRoom,
      validDirectionInput: Room.validDirectionInput,
      longToShort: Room.longToShort,
    },
  },
});

describe('lock', () => {
  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true },
        { dir: 's', roomId: 'nRoomId' },
      ],
      getExit: jasmine.createSpy('getExit').and.callFake(dir => mockRoom.exits.find(e => e.dir == dir)),
      save: jasmine.createSpy('roomSave'),
    };
  });

  it('should output message when direction is invalid', () => {
    sut.execute(socket, 'e', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No door in that direction.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should output message when direction is not a door', () => {
    sut.execute(socket, 's', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No door in that direction.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should do nothing when key name is invalid', () => {
    autocompleteResult = null;

    sut.execute(socket, 'n', 'invalid key name');

    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should succeed on valid direction with door', () => {
    // arrange
    autocompleteResult = {name: 'key', displayName: 'some key'};

    // act
    sut.execute(socket, 'n', 'some key');
    var exit = mockRoom.exits.find(e => e.dir === 'n');

    // assert
    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door locked.' });
    expect(mockRoom.save).toHaveBeenCalledTimes(1);
    expect(exit.closed).toBe(true);
    expect(exit.locked).toBe(true);
  });

  it('should be an admin command', () => {
    expect(sut.admin).toBe(true);
  });

});
