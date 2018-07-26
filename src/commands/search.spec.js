'use strict';

const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom;
let diceRoll = jasmine.createSpy();
const sut = SandboxedModule.require('./search', {
  requires: {
    '../core/dice': {
      roll: diceRoll,
    },
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
    socket.user.search = 0;
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true, hidden: false },
      ],
      inventory: [
        { name: 'ring', hidden: false },
      ],
      save: jasmine.createSpy('roomSave'),
    };
  });

  it('should reveal all when user is admin', function () {
    socket.user.admin = true;
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;

    sut.execute(socket);

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Search Roll: admin<br />' });
    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You have spotted something!<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).toHaveBeenCalled();
  });

  it('should output message when no hidden items exist in room', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = false;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = false;

    diceRoll.and.returnValue(1);

    sut.execute(socket);

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Search Roll: 1<br />' });
    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You find nothing special.<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  it('should output message if skill check fails to find anything', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;

    diceRoll.and.returnValue(3);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6

    sut.execute(socket);

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Search Roll: 3<br />' });
    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You find nothing special.<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(true);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(true);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });
/*
  it('should only reveal some items/exits if skill check doesn't fully succed', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;

    diceRoll.and.returnValue(3);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6

    sut.execute(socket);

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Search Roll: 3<br />' });
    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You find nothing special.<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(true);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(true);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });
*/
  it('should reveal hidden targets and output message when skill fully succeeds seach test', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;

    diceRoll.and.returnValue(6);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6

    sut.execute(socket);

    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Search Roll: 6<br />' });
    expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You have spotted something!<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).toHaveBeenCalled();
  });

});
