const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom;
let autocompleteResult;
const sut = SandboxedModule.require('./hide', {
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

describe('hide', () => {
  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true },
        { dir: 's', roomId: 'nRoomId' },
        { dir: 'u', roomId: 'nRoomId', hidden: true },
        { dir: 'd', roomId: 'nRoomId', hidden: false },
      ],
      getExit: jasmine.createSpy('getExit').and.callFake(dir => mockRoom.exits.find(e => e.dir == dir)),
      save: jasmine.createSpy('roomSave'),
    };
  });

  it('should output message when direction is invalid', () => {
    sut.execute(socket, 'e');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No exit in that direction.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should output message when item is invalid', () => {
    autocompleteResult = null;
    sut.execute(socket, 'emu');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Item does not exist in inventory or in room.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should succeed on valid direction', () => {
    sut.execute(socket, 'd');
    const exit = mockRoom.exits.find(e => e.dir === 'd');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'The exit has been concealed.' });
    expect(mockRoom.save).toHaveBeenCalledTimes(1);
    expect(exit.hidden).toBe(true);
  });

  it('should succeed on valid item', () => {
    autocompleteResult = [{ id: 'clownId', name: 'clown', hidden: false }];

    sut.execute(socket, 'clown');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'clown has been concealed.' });
    expect(mockRoom.save).toHaveBeenCalledTimes(1);
    expect(autocompleteResult.hidden).toBe(true);
  });

});
