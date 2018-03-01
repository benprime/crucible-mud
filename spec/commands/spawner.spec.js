'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/spawner');
const Spawner = require('../../models/spawner');
const Room = require('../../models/room');

describe('spawner', function () {
  let socket;
  let currentRoom;

  beforeEach(function () {
    currentRoom = mocks.getMockRoom();
    currentRoom.name = 'Dance Floor';
    currentRoom.spawner = Spawner;
    currentRoom.spawner.mobTypes.push(mocks.mobType.name);
    socket = new mocks.SocketMock();
    socket.user.roomId = currentRoom.id;
    socket.user.username = 'Disco Jim';
  });

  describe('execute', function () {

    it('when action is add', function () {

      var beforeLength = currentRoom.spawner.mobTypes.length;
      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'add', 'kobold');
      expect(currentRoom.save).toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Creature added to spawner.' });
      expect(currentRoom.spawner.mobTypes.length).toBeGreaterThan(beforeLength);

    });
    it('when action is remove', function () {

      var beforeLength = currentRoom.spawner.mobTypes.length;
      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'remove', 'kobold');
      expect(currentRoom.save).toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Creature removed from spawner.' });
      expect(currentRoom.spawner.mobTypes.length).toBeLessThan(beforeLength);

    });
    it('when action is remove but cannot find mob', function () {

      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'remove', 'dummy');
      expect(currentRoom.save).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Creature not found on spawner.' });

    });
    it('when action is max', function () {

      currentRoom.spawner.max = 2;
      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'max', 7);
      expect(currentRoom.save).toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Max creatures updated to 7.' });
      expect(currentRoom.spawner.max).toEqual(7);

    });
    it('when action is timeout', function () {

      currentRoom.spawner.timeout = 1;
      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'timeout', 5);
      expect(currentRoom.save).toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Timeout updated to 5.' });
      expect(currentRoom.spawner.timeout).toEqual(5);

    });
    it('when action is clear', function () {

      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'clear');
      expect(currentRoom.save).toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Spawner cleared.' });
      expect(currentRoom.spawner).toBeNull();

    });
    it('when action is copy', function () {

      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'copy');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Spawner copied.' });
      expect(socket.user.spawnerClipboard).toEqual(currentRoom.spawner);

    });
    it('when action is paste', function () {

      socket.user.spawnerClipboard = null;
      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'paste');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Spawner pasted.' });
      expect(currentRoom.spawner).toBeNull();
    });
    it('when action is not valid', function () {

      spyOn(Room, 'getById').and.callFake(() => currentRoom);
      sut.execute(socket, 'multiply');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: (currentRoom.spawner ? currentRoom.spawner.toString() : 'None.') });

    });
  });
});