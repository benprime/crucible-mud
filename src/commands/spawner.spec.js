'use strict';

const mocks = require('../../mocks');
const sut = require('../commands/spawner');
const Spawner = require('../models/spawner');
const Room = require('../models/room');

describe('spawner', function () {
  let socket;
  let currentRoom;

  beforeEach(function () {
    currentRoom = mocks.getMockRoom();
    currentRoom.name = 'Dance Floor';
    currentRoom.spawner = new Spawner();
    currentRoom.spawner.mobTypes.push(mocks.mobType.name);
    socket = new mocks.SocketMock();
    socket.user.roomId = currentRoom.id;
    socket.user.username = 'Disco Jim';
  });

  describe('execute', function () {

    describe('when action is add', function() {
      it('should successfully add valid mob type', function () {

        var beforeLength = currentRoom.spawner.mobTypes.length;
        spyOn(Room, 'getById').and.callFake(() => currentRoom);
        sut.execute(socket, 'add', 'kobold');

        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Creature added to spawner.' });
        expect(currentRoom.spawner.mobTypes.length).toBeGreaterThan(beforeLength);
      });

      it('should output error message when mob type is invalid', function () {
      });
    });

    describe('when action is remove', function() {
      it('should remove existing mob type', function () {

        var beforeLength = currentRoom.spawner.mobTypes.length;
        spyOn(Room, 'getById').and.callFake(() => currentRoom);
        sut.execute(socket, 'remove', 'kobold');

        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Creature removed from spawner.' });
        expect(currentRoom.spawner.mobTypes.length).toBeLessThan(beforeLength);
      });

      it('should output error message when mob type is invalid', function () {
      });

      it('should output error when mob type does not exist on spawner', function () {

        spyOn(Room, 'getById').and.callFake(() => currentRoom);
        sut.execute(socket, 'remove', 'dummy');

        expect(currentRoom.save).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Creature not found on spawner.' });
      });
    });


    describe('when action is max', function() {
      it('should output error message when param value is not an integer', function () {
      });

      it('should set max when value is valid', function () {

        currentRoom.spawner.max = 2;
        spyOn(Room, 'getById').and.callFake(() => currentRoom);
        sut.execute(socket, 'max', 7);

        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Max creatures updated to 7.' });
        expect(currentRoom.spawner.max).toEqual(7);

      });
    });

    describe('when action is timeout', function() {
      it('when set timeout when value is valid', function () {

        currentRoom.spawner.timeout = 1;
        spyOn(Room, 'getById').and.callFake(() => currentRoom);
        sut.execute(socket, 'timeout', 5);

        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Timeout updated to 5.' });
        expect(currentRoom.spawner.timeout).toEqual(5);

      });

      it('should output error message when param value is not an integer', function () {
      });
    });

    describe('when action is clear', function() {
      it('when action is clear', function () {

        spyOn(Room, 'getById').and.callFake(() => currentRoom);
        sut.execute(socket, 'clear');

        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Spawner cleared.' });
        expect(currentRoom.spawner).toBeNull();

      });
    });

    describe('when action is copy', function() {
      it('when action is copy', function () {

        spyOn(Room, 'getById').and.callFake(() => currentRoom);
        sut.execute(socket, 'copy');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Spawner copied.' });
        expect(socket.user.spawnerClipboard).toEqual(currentRoom.spawner);

      });
    });

    describe('when action is paste', function() {
      it('when action is paste', function () {

        socket.user.spawnerClipboard = null;
        spyOn(Room, 'getById').and.callFake(() => currentRoom);
        sut.execute(socket, 'paste');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Spawner pasted.' });
        expect(currentRoom.spawner).toBeNull();
      });
    });

    it('when action is not valid', function () {

      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'multiply');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: (currentRoom.spawner ? currentRoom.spawner.toString() : 'None.') });

    });
  });
});
