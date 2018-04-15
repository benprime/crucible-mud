'use strict';

const autocomplete = require('../core/autocomplete');
const Item = require('../models/item');
const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const mockRoom = {
  id: 'bogus',
  exits: [
    { dir: 'n', roomId: 'nRoomId', closed: true },
    { dir: 'w', roomId: 'wRoomId', closed: true, keyName: 'Gold', locked: true },
    { dir: 'nw', roomId: 'nwRoomId', closed: true, keyName: 'Silver', locked: true },
    { dir: 'ne', roomId: 'eRoomId', closed: true, keyName: 'Bronze', locked: true },
    { dir: 's', roomId: 'sRoomId' },
  ],
  getExit: jasmine.createSpy('getExit').and.callFake(dir => mockRoom.exits.find(e => e.dir == dir)),
  save: jasmine.createSpy('roomSave'),
};

let mockGlobalIO = new mocks.IOMock();
let mockAutocompleteResult;
let mockConfig = {};

const sut = SandboxedModule.require('./unlock', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompletedTypesSpy').and.callFake(() => mockAutocompleteResult),
    },
    '../models/room': {
      getById: () => mockRoom,
      oppositeDirection: Room.oppositeDirection,
      shortToLong: Room.shortToLong,
      validDirectionInput: Room.validDirectionInput,
      longToShort: Room.longToShort,
    },
    '../../config': mockConfig,
  },
  globals: { io: mockGlobalIO },
});

describe('unlock', function () {
  let socket;

  beforeAll(function () {
    mockGlobalIO.reset();
    socket = new mocks.SocketMock();

    spyOn(Room, 'getById').and.callFake(() => mockRoom);
    spyOn(autocomplete, 'autocompleteTypes').and.callFake(() => mockAutocompleteResult);
  });

  beforeEach(function () {
    socket.emit.calls.reset();
    mockRoom.save.calls.reset();
    autocomplete.autocompleteTypes.calls.reset();
  });

  it('should output message when direction is invalid', function () {
    sut.execute(socket, 'e', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No door in that direction.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should output message when a door exists but is not locked', function () {
    sut.execute(socket, 'n', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That door is not locked.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should output no messages when user is not carrying the key', function () {
    expect(socket.emit).not.toHaveBeenCalled();
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should output message when key is the wrong key for the door', function () {
    var key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Blue';
    mockAutocompleteResult = key;

    sut.execute(socket, 'ne', 'Blue');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That key does not unlock that door.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should unlock door with output message when command successful', function () {
    var key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Gold';
    mockAutocompleteResult = key;

    sut.execute(socket, 'w', 'Gold');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door unlocked.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  describe('asyncTest', function () {
    var worked = false;
    beforeEach(function (done) {
      mockGlobalIO.reset();
      mockConfig.DOOR_CLOSE_TIMER = 100;
      var key = new Item();
      key.itemTypeEnum = 'key';
      key.name = 'Silver';
      mockAutocompleteResult = key;

      sut.execute(socket, 'nw', 'Silver', function () {
        worked = true;
        done();
      });
    });

    it('should automatically relock door after timeout', function () {
      expect(mockGlobalIO.to('bogus').emit).toHaveBeenCalledWith('output', { message: 'The door to the northwest clicks locked!' });
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(worked).toBe(true);
    });
  });
});
