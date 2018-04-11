'use strict';

const Room = require('../models/room');
const mocks = require('../spec/mocks');
const sut = require('../commands/lock');

describe('lock', function () {
  let socket;
  let room;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    room = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true },
        { dir: 's', roomId: 'nRoomId' },
      ],
      getExit: jasmine.createSpy('getExit').and.callFake(dir => room.exits.find(e => e.dir == dir)),
      save: jasmine.createSpy('roomSave'),
    };
    spyOn(Room, 'getById').and.callFake(() => room);
  });

  beforeEach(function() {
    socket.emit.calls.reset();
    room.save.calls.reset();
  });

  it('should output message when direction is invalid', function () {
    sut.execute(socket, 'e', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No door in that direction.' });
    expect(room.save).not.toHaveBeenCalled();
  });

  it('should output message when direction is not a door', function () {
    sut.execute(socket, 's', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No door in that direction.' });
    expect(room.save).not.toHaveBeenCalled();
  });

  it('should do nothing (and autocomplete should print error) when key name is invalid', function () {
    sut.execute(socket, 'n', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t see that here.' });
    expect(room.save).not.toHaveBeenCalled();
  });

  it('should succeed on valid direction with door', function () {
    socket.user.keys = [{name: 'key', displayName: 'some key'}];
    sut.execute(socket, 'n', 'some key');
    var exit = room.exits.find(e => e.dir === 'n');

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Door locked.' });
    expect(room.save).toHaveBeenCalledTimes(1);
    expect(exit.closed).toBe(true);
    expect(exit.locked).toBe(true);
  });

  it('should be an admin command', function () {
    expect(sut.admin).toBe(true);
  });

});
