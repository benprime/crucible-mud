'use strict';

const roomManager = require('../../roomManager');
const mocks = require('../mocks');
const sut = require('../../commands/drop');

describe('drop', function () {
  let socket;
  let room;
  let item;
  let key;
  let invalidItem;

  beforeEach(function () {
    room = mocks.getMockRoom();
    spyOn(roomManager, 'getRoomById').and.callFake(() => room);
    socket = new mocks.SocketMock();
    item = {
      name: 'dummyItem',
      type: 'item',
      displayName: 'dropItem'
    };
    key = {
      name: 'dummyKey',
      type: 'key',
      displayName: 'dropKey'
    };
    invalidItem = {
      name: 'invalidItem',
      type: 'InvalidType',
      displayName: 'invalidDisplayName'
    };

    socket.user.inventory = [item];
    socket.user.keys = [key];
    room.inventory = [];
  });

  describe('execute', function () {
    // TODO: fix this test when autocomplete is updated
    xit('should output error message item to drop is ambiguos', function () {
      sut.execute(socket, 'drop');
      expect(socket.user.save).not.toHaveBeenCalled();
      expect(room.save).not.toHaveBeenCalled();
      expect(socket.broadcast.to().emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t seem to be carrying that!' });
    });

    describe('when item.type is item', function () {

      it('should output error message when item is not found in user inventory', function () {
        sut.execute(socket, 'non-existent item');
        expect(socket.user.save).not.toHaveBeenCalled();
        expect(room.save).not.toHaveBeenCalled();
        expect(socket.broadcast.to().emit).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t seem to be carrying that!' });
      });

      it('should remove item from user inventory and add to room inventory', function () {
        sut.execute(socket, 'dropItem');
        expect(socket.user.save).toHaveBeenCalled();
        expect(room.save).toHaveBeenCalled();
        expect(socket.user.inventory.length).toBe(0);
        expect(room.inventory[0]).toBe(item)
        expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'TestUser drops dropItem.' });
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Dropped.' });
      });
    });

    describe('when item.type is key', function () {
      it('should remove key from user keys and add to room inventory', function () {
        sut.execute(socket, 'dropKey');
        expect(socket.user.save).toHaveBeenCalled();
        expect(room.save).toHaveBeenCalled();
        expect(socket.user.keys.length).toBe(0);
        expect(room.inventory[0]).toBe(key)
        expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'TestUser drops dropKey.' });
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
      expect(socket.broadcast.to().emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown item type!' });
    });

  });

});