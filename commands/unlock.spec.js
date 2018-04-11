'use strict';

const autocomplete = require('../autocomplete');
const config = require('../config');
const Item = require('../models/item');
const Room = require('../models/room');
const mocks = require('../spec/mocks');
const sut = require('../commands/unlock');

describe('unlock', function () {
  let socket;
  let room;
  let autocompleteResult;

  beforeAll(function () {
    global.io = new mocks.IOMock();
    socket = new mocks.SocketMock();
    room = {
      exits: [
        { dir: 'n', roomId: 'nRoomId', closed: true },
        { dir: 'w', roomId: 'wRoomId', closed: true, keyName: 'Gold', locked: true },
        { dir: 'nw', roomId: 'nwRoomId', closed: true, keyName: 'Silver', locked: true },
        { dir: 's', roomId: 'sRoomId' },
      ],
      getExit: jasmine.createSpy('getExit').and.callFake(dir => room.exits.find(e => e.dir == dir)),
      save: jasmine.createSpy('roomSave'),
    };
    room.id = 'bogus';
    spyOn(Room, 'getById').and.callFake(() => room);
    spyOn(autocomplete, 'autocompleteTypes').and.callFake(() => autocompleteResult);
  });

  beforeEach(function () {
    socket.emit.calls.reset();
    room.save.calls.reset();
    autocomplete.autocompleteTypes.calls.reset();
  });

  it('should output message when direction is invalid', function () {
    sut.execute(socket, 'e', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No door in that direction.' });
    expect(room.save).not.toHaveBeenCalled();
  });

  it('should output message when a door exists but is not locked', function () {
    sut.execute(socket, 'n', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That door is not locked.' });
    expect(room.save).not.toHaveBeenCalled();
  });

  it('should output no messages when user is not carrying the key', function () {
    expect(socket.emit).not.toHaveBeenCalled();
    expect(room.save).not.toHaveBeenCalled();
  });

  it('should output message when key is the wrong key for the door', function () {
    var key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Blue';
    autocompleteResult = key;

    sut.execute(socket, 'w', 'Blue');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'That key does not unlock that door.' });
    expect(room.save).not.toHaveBeenCalled();
  });

  it('should unlock door with output message when command successful', function () {
    var key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Gold';
    autocompleteResult = key;

    sut.execute(socket, 'w', 'Gold');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door unlocked.' });
    expect(room.save).not.toHaveBeenCalled();
  });

  describe('asyncTest', function () {
    var worked = false;
    beforeEach(function (done) {
      global.io = new mocks.IOMock();
      config.DOOR_CLOSE_TIMER = 100;
      var key = new Item();
      key.itemTypeEnum = 'key';
      key.name = 'Silver';
      autocompleteResult = key;

      sut.execute(socket, 'nw', 'Silver', function () {
        worked = true;
        done();
      });
    });

    it('should automatically relock door after timeout', function () {
      expect(global.io.to('bogus').emit).toHaveBeenCalledWith('output', { message: 'The door to the northwest clicks locked!' });
      expect(room.save).not.toHaveBeenCalled();
      expect(worked).toBe(true);
    });
  });
});
