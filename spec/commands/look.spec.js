'use strict';

const mocks = require('../mocks');
const Room = require('../../models/room');
const sut = require('../../commands/look');
const autocomplete = require('../../autocomplete');

describe('look', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('dispatch triggers execute', function () {
    let executeSpy;

    beforeAll(function () {
      executeSpy = spyOn(sut, 'execute');
    });

    afterAll(function () {
      executeSpy.and.callThrough();
    });

    it('on short pattern', function () {
      sut.dispatch(socket, ['']);

      expect(executeSpy).toHaveBeenCalledWith(socket, true, null);
    });

    it('on long pattern', function () {
      let lookTarget = 'look_target';
      sut.dispatch(socket, ['l', lookTarget]);

      expect(executeSpy).toHaveBeenCalledWith(socket, false, lookTarget);
    });
  });

  describe('execute', function () {
    let room;
    let autocompleteResult;
    let shortDir;

    beforeAll(function () {
      room = mocks.getMockRoom();
      room.id = socket.user.roomId;
      spyOn(autocomplete, 'autocomplete').and.callFake(() => autocompleteResult);
      spyOn(Room, 'getById').and.callFake(() => room);
      shortDir = 'n';
      spyOn(Room, 'oppositeDirection').and.callFake(() => 'opposite');
      spyOn(Room, 'shortToLong').and.callFake(() => 'exit name');
      spyOn(Room, 'validDirectionInput').and.callFake(() => shortDir);
    });

    beforeEach(function () {
      autocomplete.autocomplete.calls.reset();
      Room.getById.and.callFake(() => room);
      Room.getById.calls.reset();
      Room.oppositeDirection.calls.reset();
      Room.shortToLong.calls.reset();
      Room.validDirectionInput.calls.reset();
      socket.emit.calls.reset();
      room.exits = [];
    });

    it('should output short room look when short param is true', function () {
      sut.execute(socket, true);

      expect(room.look).toHaveBeenCalledWith(socket, true);
    });

    it('should output room look when lookTarget is not passed', function () {
      sut.execute(socket, false);

      expect(room.look).toHaveBeenCalledWith(socket, false);
    });

    it('should output room look when lookTarget is a direction', function () {
      const targetRoom = mocks.getMockRoom();
      room.exits.push({
        closed: false,
        dir: shortDir,
        roomId: targetRoom.id,
      });

      Room.getById.and.returnValues(room, targetRoom);

      sut.execute(socket, false, shortDir);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You look to the exit name...' });
      expect(socket.broadcast.to(targetRoom.id).emit).toHaveBeenCalledWith('output', { message: `<span class="yellow">${socket.user.username} peaks in from the exit name.</span>` });
      expect(targetRoom.look).toHaveBeenCalledWith(socket, false);
    });

    it('should output a message when lookTarget is a direction with a closed door', function () {
      room.exits.push({
        closed: true,
        dir: 'n',
      });
      sut.execute(socket, false, 'n');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'The door in that direction is closed!' });
    });

    it('should do nothing when lookTarget is an invalid inventory item', function () {
      Room.validDirectionInput.and.callFake(() => null);
      socket.user.inventory = [{ displayName: 'boot', desc: 'an old boot' }];
      autocompleteResult = undefined;

      sut.execute(socket, false, 'boot');

      expect(socket.emit).not.toHaveBeenCalled();
    });

  });

  it('help should output message', function () {
    sut.help(socket);

    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';

    expect(socket.emit).toHaveBeenCalledWith('output', { message: output });
  });
});