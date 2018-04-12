'use strict';

// clear spies on socketUtil module
delete require.cache[require.resolve('./socketUtil')];

const socketUtil = require('./socketUtil');
const mocks = require('./mocks');

describe('socketUtil', function () {

  beforeEach(function () {
    global.io = new mocks.IOMock();
  });

  describe('socketInRoom', function () {
    beforeEach(function() {
      global.io.sockets.adapter.rooms = {};
    });

    it('returns false for invalid roomId', function () {
      // act
      const result = socketUtil.socketInRoom('invalidRoomId', 'socketId');

      // arrange
      expect(result).toBe(false);
    });

    it('returns true when socket exists in the room', function () {
      // arrange
      let socket = new mocks.SocketMock();
      let sockets = {};
      sockets[socket.id] = socket;
      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms['testroom'] = {
        sockets: sockets,
      };

      // act
      const result = socketUtil.socketInRoom('testroom', socket.id);

      // arrange
      expect(result).toBe(true);
    });

    it('returns false when socket does not exist in the room', function () {
      // arrange
      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms['testroom'] = {
        sockets: {},
      };

      // act
      const result = socketUtil.socketInRoom('testroom', 'sockddetId');

      // arrange
      expect(result).toBe(false);
    });

  });

  describe('roomMessage', function () {
    let room;
    let socket;

    beforeAll(function() {
      room = mocks.getMockRoom();
      socket = new mocks.SocketMock();
    });

    it('does not send messages when roomid is invalid', function () {
      // arrange
      const message = 'test message';
      const exclude = null;
      let sockets = {};
      sockets[socket.id] = socket;
      global.io.sockets.connected[socket.id] = socket;
      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms[room.id] = {
        sockets: sockets,
      };

      // act
      socketUtil.roomMessage('invalid room id', message, exclude);

      // arrange
      expect(socket.emit).not.toHaveBeenCalled();
    });

    it('should send message to every socket in the room', function () {
      // arrange
      const socketA = new mocks.SocketMock();
      const socketB = new mocks.SocketMock();
      const socketC = new mocks.SocketMock();
      const message = 'test message';
      const exclude = null;
      let sockets = {};
      sockets[socketA.id] = socketA;
      sockets[socketB.id] = socketB;
      sockets[socketC.id] = socketC;

      global.io.sockets.connected[socketA.id] = socketA;
      global.io.sockets.connected[socketB.id] = socketB;
      global.io.sockets.connected[socketC.id] = socketC;

      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms[room.id] = {
        sockets: sockets,
      };

      // act
      socketUtil.roomMessage(room.id, message, exclude);

      // arrange
      expect(socketA.emit).toHaveBeenCalled();
      expect(socketB.emit).toHaveBeenCalled();
      expect(socketC.emit).toHaveBeenCalled();
    });

    it('should exclude sockets passed in the exclude array', function () {
      // arrange
      const socketA = new mocks.SocketMock();
      const socketB = new mocks.SocketMock();
      const socketC = new mocks.SocketMock();
      const message = 'test message';
      const exclude = [socketB.id.toString(), socketC.id.toString()];
      let sockets = {};
      sockets[socketA.id] = socketA;
      sockets[socketB.id] = socketB;
      sockets[socketC.id] = socketC;

      global.io.sockets.connected[socketA.id] = socketA;
      global.io.sockets.connected[socketB.id] = socketB;
      global.io.sockets.connected[socketC.id] = socketC;

      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms[room.id] = {
        sockets: sockets,
      };

      // act
      socketUtil.roomMessage(room.id, message, exclude);

      // arrange
      expect(socketA.emit).toHaveBeenCalled();
      expect(socketB.emit).not.toHaveBeenCalled();
      expect(socketC.emit).not.toHaveBeenCalled();
    });

  });

  describe('getSocketByUsername', function () {
    let socket;

    it('returns socket when username found in connected sockets', function () {
      // arrange
      socket = new mocks.SocketMock();
      global.io.sockets.connected[socket.id] = socket;

      // act
      const result = socketUtil.getSocketByUsername(socket.user.username);

      // assert
      expect(result).toBe(socket);
    });

    it('returns null when username not found in connected sockets', function () {
      // act
      const result = socketUtil.getSocketByUsername('unknown username');

      // assert
      expect(result).toBeNull();
    });

  });

  describe('getSocketByUserId', function () {
    let socket;

    it('returns socket when userId found in connected sockets', function () {
      // arrange
      socket = new mocks.SocketMock();
      global.io.sockets.connected[socket.id] = socket;

      // act
      const result = socketUtil.getSocketByUserId(socket.user.id);

      // assert
      expect(result).toBe(socket);
    });

    it('returns null when userId not found in connected sockets', function () {
      // act
      const result = socketUtil.getSocketByUserId(socket.user.id);

      // assert
      expect(result).toBeNull();
    });
  });

  describe('getRoomSockets', function () {
    let room;

    beforeAll(function () {
      global.io = new mocks.IOMock();
      room = mocks.getMockRoom();
    });

    it('should return an empty array when no sockets exist in the room', function () {
      let result = socketUtil.getRoomSockets(room.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return an array of sockets when the room is populated with users', function () {
      global.io.sockets.adapter.rooms[room.id] = {
        sockets: [
          {},
          {},
        ],
      };

      let result = socketUtil.getRoomSockets(room.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

});
