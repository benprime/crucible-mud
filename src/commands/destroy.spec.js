'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom = mocks.getMockRoom();
let autocompleteResult;
const sut = SandboxedModule.require('./destroy', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompleteTypesSpy').and.callFake(() => autocompleteResult),
    },
    '../models/room': {
      getById: () => mockRoom,
    },
  },
});

describe('destroy', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  beforeEach(function () {
    socket.reset();
    mockRoom.reset();
  });

  describe('execute', function () {

    describe('when type is mob', function () {

      it('should do nothing when mob is not found', function () {
        // arrange
        autocompleteResult = null;

        // act
        sut.execute(socket, 'mob', 'not found name');

        // assert
        expect(socket.emit).not.toHaveBeenCalled();
        
        expect(mockRoom.mobs.remove).not.toHaveBeenCalled();
      });

      it('should remove mob from room and output messages when successful', function () {
        // arrange
        autocompleteResult = {};

        // act
        sut.execute(socket, 'mob', 'mob name');

        // assert
        expect(socket.emit).toHaveBeenCalledTimes(1);
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Mob successfully destroyed.' });
        expect(mockRoom.mobs.remove).toHaveBeenCalledTimes(1);
      });
    });

    describe('when type is item', function () {
      beforeEach(function() {
        socket.reset();
        mockRoom.reset();
      });

      it('should do nothing when inventory does not contain item', function () {
        // arrange
        autocompleteResult = null;

        // act
        sut.execute(socket, 'item', 'non-existant item');

        // assert
        expect(socket.emit).not.toHaveBeenCalled();
        expect(socket.user.inventory.remove).not.toHaveBeenCalled();
        expect(socket.user.save).not.toHaveBeenCalled();
      });

      it('should remove item from inventory when successful', function () {
        // arrange
        let item = {};
        autocompleteResult = {};

        // act
        sut.execute(socket, 'item', 'item name');

        // assert
        expect(socket.emit).toHaveBeenCalledTimes(1);
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Item successfully destroyed.' });
        expect(socket.user.inventory.remove).toHaveBeenCalledWith(item);
        expect(socket.user.save).toHaveBeenCalledTimes(1);
      });
    });

    it('should output error when create type is invalid', function () {
      // act
      sut.execute(socket, 'invalid type', 'name of thing to destroy');

      // assert
      expect(socket.emit).toHaveBeenCalledTimes(1);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Invalid destroy type.' });
      expect(socket.user.inventory.remove).not.toHaveBeenCalled();
      expect(socket.user.save).not.toHaveBeenCalled();
    });

    it('should be an admin command', function () {
      expect(sut.admin).toBe(true);
    });

  });

});