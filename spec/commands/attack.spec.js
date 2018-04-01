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
    spyOn(autocomplete, 'autocompleteTypes').and.callFake(() => autocompleteResult);
  });

  beforeEach(function () {
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

    it('should set state and emit output when valid target found', function () {
      autocompleteResult = {
        item: {
          id: 123,
          displayName: 'a thing!',
        },
        type: 'mob',
      };
      attack.execute(socket, 'thing');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      expect(socket.broadcast.to(socket.user.roomId.toString()).emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} moves to attack ${autocompleteResult.displayName}!` });
      expect(socket.user.attackTarget).toBe(autocompleteResult.item.id);
    });

    it('should set state and emit output when no target found', function () {
      autocompleteResult = null;
      attack.execute(socket, 'thing');

      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.user.attackTarget).toBeFalsy();
    });
  });
});
