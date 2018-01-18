'use strict';

const Room = require('../../models/room');
const Item = require('../../models/item');
const mocks = require('../mocks');
const sut = require('../../commands/drop');

describe('drop', function () {
  let socket;
  let room;
  let item;
  let key;
  let invalidItem;

  beforeAll(function () {
    // just a matcher that works like toEqual, but does not do a type check.
    // This just compares the json representation of the objects being compared.
    jasmine.addMatchers({
      toBeJsonEqual: function () {
        return {
          compare: function (actual, expected) {
            let result = {};
            let jsonActual = JSON.orderedStringify(actual);
            let jsonExpected = JSON.orderedStringify(expected);
            result.pass = jsonActual === jsonExpected;
            if (result.pass) {
              result.message = 'Expected ' + jsonActual + ' to equal ' + jsonExpected;
            } else {
              result.message = 'Expected ' + jsonActual + ' to equal ' + jsonExpected;
            }
            return result;
          },
        };
      },
    });
  });

  beforeEach(function () {
    room = mocks.getMockRoom();
    spyOn(Room, 'getById').and.callFake(() => room);
    socket = new mocks.SocketMock();

    item = new Item();
    item.name = 'dummyItem';
    item.type = 'item';
    item.displayName = 'dropItem';

    key = new Item();
    key.name = 'dummyKey';
    key.type = 'key';
    key.displayName = 'dropKey';

    invalidItem = new Item();
    invalidItem.name = 'invalidItem';
    invalidItem.type = 'InvalidType';
    invalidItem.displayName = 'invalidDisplayName';

    socket.user.inventory = [item];
    socket.user.keys = [key];
    room.inventory = [];
  });

  describe('execute', function () {
    // TODO: fix this test when autocomplete is updated
    it('should do nothing when item to drop is ambiguous', function () {
      sut.execute(socket, 'drop');

      expect(socket.user.save).not.toHaveBeenCalled();
      expect(room.save).not.toHaveBeenCalled();
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
    });

    describe('when item.type is item', function () {

      it('should output error message when item is not found in user inventory', function () {
        sut.execute(socket, 'non-existent item');

        expect(socket.user.save).not.toHaveBeenCalled();
        expect(room.save).not.toHaveBeenCalled();
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t see that here.' });
      });

      it('should remove item from user inventory and add to room inventory', function () {
        sut.execute(socket, 'dropItem');

        expect(socket.user.save).toHaveBeenCalled();
        expect(room.save).toHaveBeenCalled();
        expect(socket.user.inventory.length).toBe(0);
        expect(room.inventory[0].toObject()).toBeJsonEqual(item.toObject());
        expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser drops dropItem.' });
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Dropped.' });
      });
    });

    describe('when item.type is key', function () {
      it('should remove key from user keys and add to room inventory', function () {
        sut.execute(socket, 'dropKey');

        expect(socket.user.save).toHaveBeenCalled();
        expect(room.save).toHaveBeenCalled();
        expect(socket.user.keys.length).toBe(0);
        expect(room.inventory[0].toObject()).toBeJsonEqual(key.toObject());
        expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser drops dropKey.' });
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Dropped.' });
      });
    });

    it('should output error when item type is invalid', function () {
      // Arrange
      socket.user.inventory = [invalidItem];

      // Act
      sut.execute(socket, 'invalidDisplayName');

      // Assert
      expect(socket.user.save).not.toHaveBeenCalled();
      expect(room.save).not.toHaveBeenCalled();
      expect(socket.user.keys.length).toBe(1);
      expect(socket.user.inventory.length).toBe(1);
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown item type!' });
    });

  });

});