'use strict';

const attack = require('../../commands/attack.js');
const Room = require('../../models/room');
const autocomplete = require('../../autocomplete');
const mocks = require('../mocks.js');

describe('attack', function () {
  let socket;
  let room;
  let autocompleteResult;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(Room, 'getById').and.callFake(() => room);
    spyOn(autocomplete, 'autocomplete').and.callFake(() => autocompleteResult);
  });

  beforeEach(function() {
    socket.reset();
  });

  describe('dispatch triggers execute', function () {
    let executeSpy;

    beforeAll(function () {
      executeSpy = spyOn(attack, 'execute');
    });

    afterAll(function () {
      executeSpy.and.callThrough();
    });

    it('on short pattern', function () {
      autocompleteResult = 'thing';
      attack.dispatch(socket, ['a th', 'thing']);

      expect(executeSpy).toHaveBeenCalledWith(socket, autocompleteResult);
    });
  });

  describe('execute', function () {
    beforeAll(function () {
      socket = new mocks.SocketMock();
      socket.user.username = 'aName';
      socket.user.roomId = room.id;
    });

    it('emits and broadcasts', function () {
      autocompleteResult = {
        id: 123,
        displayName: 'a thing!',
      };
      attack.execute(socket, 'thing');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      expect(socket.broadcast.to(socket.user.roomId.toString()).emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} moves to attack ${autocompleteResult.displayName}!` });
    });

    it('emits with no target', function () {
      autocompleteResult = undefined;
      attack.execute(socket, 'thing');

      expect(socket.emit).not.toHaveBeenCalled();
    });
  });
});