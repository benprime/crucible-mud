'use strict';

const autocomplete = require('../../autocomplete');
const Room = require('../../models/room');
const mocks = require('../mocks');
const sut = require('../../commands/destroy');

describe('destroy', function () {
  let socket;
  let room;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(Room, 'getRoomById').and.callFake(() => room);
    spyOn(room.mobs, 'remove');
    spyOn(socket.user.inventory, 'remove');
    spyOn(autocomplete, 'autocomplete');
  });

  beforeEach(function () {
    socket.emit.calls.reset();
    socket.broadcast.to().emit.calls.reset();
    Room.getRoomById.calls.reset();
    room.mobs.remove.calls.reset();
    socket.user.inventory.remove.calls.reset();
    socket.user.save.calls.reset();
  });

  describe('execute', function () {

    describe('when type is mob', function () {
      beforeEach(function () {
      });

      it('should output error message when mob not found', function () {
        // arrange
        autocomplete.autocomplete.and.callFake(() => null);

        // act
        sut.execute(socket, 'mob', 'not found name');

        // assert
        expect(socket.emit).toHaveBeenCalledTimes(1);
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t see that here.' });
        expect(room.mobs.remove).not.toHaveBeenCalled();
      });

      it('should remove mob from room and output messages when successful', function () {
        // arrange
        autocomplete.autocomplete.and.callFake(() => { return {}; });

        // act
        sut.execute(socket, 'mob', 'mob name');

        // assert
        expect(socket.emit).toHaveBeenCalledTimes(1);
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Mob successfully destroyed.' });
        expect(room.mobs.remove).toHaveBeenCalledTimes(1);
      });
    });

    describe('when type is item', function () {
      it('should output error when inventory does not contain item', function () {
        // arrange
        autocomplete.autocomplete.and.callFake(() => null);

        // act
        sut.execute(socket, 'item', 'non-existant item');

        // assert
        expect(socket.emit).toHaveBeenCalledTimes(1);
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t see that here.' });
        expect(socket.user.inventory.remove).not.toHaveBeenCalled();
        expect(socket.user.save).not.toHaveBeenCalled();
      });

      it('should remove item from inventory when successful', function () {
        // arrange
        let item = {};
        autocomplete.autocomplete.and.callFake(() => { return {}; });

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