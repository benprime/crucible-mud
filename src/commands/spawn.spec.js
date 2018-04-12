'use strict';

const mocks = require('../../mocks');
const Room = require('../models/room');
const sut = require('../commands/spawn');

describe('spawn', function () {
  let socket;
  let room;

  beforeEach(function () {
    room = mocks.getMockRoom();
    spyOn(Room, 'getById').and.callFake(() => room);
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    describe('when type is mob', function() {
      it('should output message when type name is invalid', function() {
        sut.execute(socket, 'mob', 'name');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown mob type.' });
      });

      it('should create instance of mob in room mobs list', function() {
        sut.execute(socket, 'mob', 'kobold');

        expect(room.mobs.length).toBe(1);
        expect(room.mobs[0].displayName.endsWith('kobold sentry')).toBeTruthy();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Summoning successful.' });
        expect(room.save).not.toHaveBeenCalled();
      });

    });

    describe('when type is item', function() {
      it('should output message when type name is invalid', function() {
        sut.execute(socket, 'item', 'name');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown item type.' });
      });

      it('should create instance of item in user inventory', function() {
        sut.execute(socket, 'item', 'shortsword');

        expect(socket.user.inventory.length).toBe(1);
        expect(socket.user.inventory[0].displayName).toBe('short sword');
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Item created.' });
        expect(socket.user.save).toHaveBeenCalled();
      });
    });

    describe('when type is key', function() {
      it('should output message when type name is invalid', function() {
        sut.execute(socket, 'key', 'name');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown key type.' });
      });

      it('should create instance of key in user keys', function() {
        sut.execute(socket, 'key', 'jadekey');

        expect(socket.user.keys.length).toBe(1);
        expect(socket.user.keys[0].displayName).toBe('jade key');
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Key created.' });
        expect(socket.user.save).toHaveBeenCalled();
      });
    });

    it('should output message when object type is invalid', function() {
      sut.execute(socket, 'unknownType', 'name');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown object type.' });
    });
  });
});
