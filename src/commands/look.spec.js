'use strict';

const mocks = require('../../spec/mocks');
const Room = require('../models/room');
const SandboxedModule = require('sandboxed-module');

let autocompleteResult;
let mockRoom;
let mockRooms = {};
const sut = SandboxedModule.require('./look', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompleteTypesSpy').and.callFake(() => autocompleteResult),
    },
    '../models/room': {
      getById: (key) => {
        return mockRooms[key];
      },
      shortToLong: Room.shortToLong,
      validDirectionInput: Room.validDirectionInput,
      longToShort: Room.longToShort,
      oppositeDirection: Room.oppositeDirection,
    },
  },
});

describe('look', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  describe('dispatch triggers execute', () => {
    let executeSpy;

    beforeAll(() => {
      executeSpy = spyOn(sut, 'execute');
    });

    it('on short pattern', () => {
      sut.dispatch(socket, ['']);

      expect(executeSpy).toHaveBeenCalledWith(socket, true, null);
    });

    it('on long pattern', () => {
      let lookTarget = 'look_target';
      sut.dispatch(socket, ['l', lookTarget]);

      expect(executeSpy).toHaveBeenCalledWith(socket, false, lookTarget);
    });
  });

  describe('execute', () => {
    let shortDir;

    beforeEach(() => {
      mockRoom = mocks.getMockRoom();
      mockRooms = {};
      mockRooms[socket.user.roomId] = mockRoom;

      shortDir = 'n';
      spyOn(Room, 'oppositeDirection').and.callFake(() => 'opposite');
      spyOn(Room, 'shortToLong').and.callFake(() => 'exit name');
      spyOn(Room, 'validDirectionInput').and.callFake(() => shortDir);

      Room.oppositeDirection.calls.reset();
      Room.shortToLong.calls.reset();
      Room.validDirectionInput.calls.reset();
      socket.emit.calls.reset();
      mockRoom.exits = [];
    });

    it('should output short room look when short param is true', () => {
      sut.execute(socket, true);

      expect(mockRoom.look).toHaveBeenCalledWith(socket, true);
    });

    it('should output room look when lookTarget is not passed', () => {
      sut.execute(socket, false);

      expect(mockRoom.look).toHaveBeenCalledWith(socket, false);
    });

    it('should output room look when lookTarget is a direction', () => {
      // arrange
      const targetRoom = mocks.getMockRoom();
      mockRoom.exits.push({
        closed: false,
        dir: shortDir,
        roomId: targetRoom.id,
      });
      mockRooms[targetRoom.id] = targetRoom;

      // act
      sut.execute(socket, false, shortDir);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You look to the north...' });
      expect(socket.broadcast.to(targetRoom.id).emit).toHaveBeenCalledWith('output', { message: `<span class="yellow">${socket.user.username} peaks in from the south.</span>` });
      expect(targetRoom.look).toHaveBeenCalledWith(socket, false);
    });

    it('should output a message when lookTarget is a direction with a closed door', () => {
      // arrange
      mockRoom.exits.push({
        closed: true,
        dir: 'n',
      });

      // act
      sut.execute(socket, false, 'n');

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'The door in that direction is closed!' });
    });

    it('should do nothing when lookTarget is an invalid inventory item', () => {
      Room.validDirectionInput.and.callFake(() => null);
      socket.user.inventory = [{ displayName: 'boot', desc: 'an old boot' }];
      autocompleteResult = undefined;

      sut.execute(socket, false, 'boot');

      expect(socket.emit).not.toHaveBeenCalled();
    });

  });

  it('help should output message', () => {
    sut.help(socket);

    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';

    expect(socket.emit).toHaveBeenCalledWith('output', { message: output });
  });
});
