'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom = {};
let mockRoomCache = {};
let mockReturnSocket = {};
const sut = SandboxedModule.require('./teleport', {
  requires: {
    '../core/autocomplete': {},
    '../models/room': {
      roomCache: mockRoomCache,
      getById: jasmine.createSpy('getByIdSpy').and.callFake(() => mockRoom),
    },
    '../core/socketUtil': {
      'getSocketByUsername' : () => mockReturnSocket,
    },
  },
});

describe('teleport', function () {
  let socket, otherSocket;
  let currentRoom, otherRoom;

  beforeAll(function () {
    currentRoom = mocks.getMockRoom();
    currentRoom.name = 'OLD';
    otherRoom = mocks.getMockRoom();
    otherRoom.name = 'NEW';
    socket = new mocks.SocketMock();
    socket.user.username = 'TestUser';
    socket.user.roomId = currentRoom.id;
    otherSocket = new mocks.SocketMock();
    otherSocket.user.username = 'OtherUser';
    otherSocket.user.roomId = otherRoom.id;
  });

  describe('execute', function () {

    it('should teleport to another user\'s room if parameter is a username', function () {
      mockReturnSocket = otherSocket;
      mockRoom = otherRoom;

      // set current room
      socket.user.roomId = currentRoom.id;

      // teleport to user
      sut.execute(socket, 'OtherUser');

      // check current room
      expect(socket.user.roomId).toEqual(otherRoom._id);
      expect(socket.user.save).toHaveBeenCalled();
    });

    it('should teleport to room if parameter is a room', function () {
      mockRoom = otherRoom;
      mockReturnSocket = socket;

      // set current room
      socket.user.roomId = currentRoom.id;

      // teleport to room
      let toRoom = otherRoom.id;
      sut.execute(socket, toRoom);

      // check current room
      expect(socket.user.roomId).toEqual(otherRoom._id);
      expect(socket.user.save).toHaveBeenCalled();

    });

    it('should output messages when room cannot be found', function () {

      mockRoom = null;

      let toRoom = otherRoom.id;
      mockRoomCache[toRoom] = {};
      sut.execute(socket, toRoom);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Room not found.' });

    });

    it('should output messages when target is invalid user', function () {
      // arrange
      mockReturnSocket = null;

      // act
      sut.execute(socket, 'Bobby');

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Target not found.' });
    });

    it('should be an admin command', function () {
      expect(sut.admin).toBe(true);
    });

  });

});
