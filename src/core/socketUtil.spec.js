'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');
const ObjectId = require('mongodb').ObjectId;

let mockGlobalIO = new mocks.IOMock();
const sut = SandboxedModule.require('./socketUtil', {
  globals: { io: mockGlobalIO },
});


describe('socketUtil', () => {

  describe('socketInRoom', () => {
    beforeEach(() => {
      mockGlobalIO.sockets.adapter.rooms = {};
    });

    it('returns false for invalid roomId', () => {
      // act
      const result = sut.socketInRoom('invalidRoomId', 'socketId');

      // arrange
      expect(result).toBe(false);
    });

    it('returns true when socket exists in the room', () => {
      // arrange
      let socket = new mocks.SocketMock();
      let sockets = {};
      sockets[socket.id] = socket;
      mockGlobalIO.sockets.adapter.rooms = {};
      mockGlobalIO.sockets.adapter.rooms['testroom'] = {
        sockets,
      };

      // act
      const result = sut.socketInRoom('testroom', socket.id);

      // arrange
      expect(result).toBe(true);
    });

    it('returns false when socket does not exist in the room', () => {
      // arrange
      mockGlobalIO.sockets.adapter.rooms = {};
      mockGlobalIO.sockets.adapter.rooms['testroom'] = {
        sockets: {},
      };

      // act
      const result = sut.socketInRoom('testroom', 'unknownSocketId');

      // arrange
      expect(result).toBe(false);
    });

  });

  describe('roomMessage', () => {
    let room;
    let socket;

    beforeAll(() => {
      mockGlobalIO.reset();
      room = mocks.getMockRoom();
      socket = new mocks.SocketMock();
    });

    it('does not send messages when roomid is invalid', () => {
      // arrange
      const message = 'test message';
      const exclude = null;
      let sockets = {};
      sockets[socket.id] = socket;
      mockGlobalIO.sockets.connected[socket.id] = socket;
      mockGlobalIO.sockets.adapter.rooms = {};
      mockGlobalIO.sockets.adapter.rooms[room.id] = {
        sockets,
      };

      // act
      sut.roomMessage('invalid room id', message, exclude);

      // arrange
      expect(socket.emit).not.toHaveBeenCalled();
    });

    it('should send message to every socket in the room', () => {
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

      mockGlobalIO.sockets.connected[socketA.id] = socketA;
      mockGlobalIO.sockets.connected[socketB.id] = socketB;
      mockGlobalIO.sockets.connected[socketC.id] = socketC;

      mockGlobalIO.sockets.adapter.rooms = {};
      mockGlobalIO.sockets.adapter.rooms[room.id] = {
        sockets,
      };

      // act
      sut.roomMessage(room.id, message, exclude);

      // arrange
      expect(socketA.emit).toHaveBeenCalled();
      expect(socketB.emit).toHaveBeenCalled();
      expect(socketC.emit).toHaveBeenCalled();
    });

    it('should exclude sockets passed in the exclude array', () => {
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

      mockGlobalIO.sockets.connected[socketA.id] = socketA;
      mockGlobalIO.sockets.connected[socketB.id] = socketB;
      mockGlobalIO.sockets.connected[socketC.id] = socketC;

      mockGlobalIO.sockets.adapter.rooms = {};
      mockGlobalIO.sockets.adapter.rooms[room.id] = {
        sockets,
      };

      // act
      sut.roomMessage(room.id, message, exclude);

      // arrange
      expect(socketA.emit).toHaveBeenCalled();
      expect(socketB.emit).not.toHaveBeenCalled();
      expect(socketC.emit).not.toHaveBeenCalled();
    });

  });

  describe('getSocketByUsername', () => {
    let socket;

    beforeEach(() => {
      mockGlobalIO.reset();
    });

    it('returns socket when username found in connected sockets', () => {
      // arrange
      socket = new mocks.SocketMock();
      mockGlobalIO.sockets.connected[socket.id] = socket;

      // act
      const result = sut.getSocketByUsername(socket.user.username);

      // assert
      expect(result).toBe(socket);
    });

    it('returns null when username not found in connected sockets', () => {
      // act
      const result = sut.getSocketByUsername('unknown username');

      // assert
      expect(result).toBeNull();
    });

  });

  describe('getSocketByUserId', () => {
    let socket;

    it('returns socket when userId found in connected sockets', () => {
      // arrange
      mockGlobalIO.reset();
      socket = new mocks.SocketMock();
      mockGlobalIO.sockets.connected[socket.id] = socket;

      // act
      const result = sut.getSocketByUserId(socket.user.id);

      // assert
      expect(result).toBe(socket);
    });

    it('returns null when userId not found in connected sockets', () => {
      // arrange
      socket = new mocks.SocketMock();

      // act
      const result = sut.getSocketByUserId(socket.user.id);

      // assert
      expect(result).toBeNull();
    });
  });

  describe('getRoomSockets', () => {
    let room;

    beforeAll(() => {
      mockGlobalIO.reset();
      room = mocks.getMockRoom();
    });

    it('should return an empty array when no sockets exist in the room', () => {
      let result = sut.getRoomSockets('room with no sockets');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return an array of sockets when the room is populated with users', () => {
      mockGlobalIO.sockets.adapter.rooms[room.id] = {
        sockets: [
          {},
          {},
        ],
      };

      let result = sut.getRoomSockets(room.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('getFollowingSockets', () => {
    beforeEach(() => {
      mockGlobalIO.reset();
    });

    it('should return all sockets where leader matches', () => {
      // arrange
      const leaderId = new ObjectId().valueOf();

      const follower1 = new mocks.SocketMock('follower1');
      const follower2 = new mocks.SocketMock('follower2');
      const follower3 = new mocks.SocketMock('follower3');

      follower1.leader = leaderId;
      follower2.leader = leaderId;
      follower3.leader = leaderId;

      const nonFollower1 = new mocks.SocketMock('nonFollower1');
      const nonFollower2 = new mocks.SocketMock('nonFollower2');
      const nonFollower3 = new mocks.SocketMock('nonFollower3');

      mockGlobalIO.sockets.connected[follower1.id] = follower1;
      mockGlobalIO.sockets.connected[follower2.id] = follower2;
      mockGlobalIO.sockets.connected[follower3.id] = follower3;
      mockGlobalIO.sockets.connected[nonFollower1.id] = nonFollower1;
      mockGlobalIO.sockets.connected[nonFollower2.id] = nonFollower2;
      mockGlobalIO.sockets.connected[nonFollower3.id] = nonFollower3;

      // act
      const result = sut.getFollowingSockets(leaderId);

      // assert
      expect(result.length).toBe(3);
      expect(result[0]).toBe(follower1);
      expect(result[1]).toBe(follower2);
      expect(result[2]).toBe(follower3);
    });
  });

  describe('validUserInRoom', () => {
    let socket;

    beforeEach(() => {
      mockGlobalIO.reset();
    });

    it('should return false if user is not logged in', () => {
      // arrange
      var roomId = new ObjectId().valueOf();

      // acting user
      socket = new mocks.SocketMock();
      socket.roomId = roomId;

      // target user
      let targetSocket = new mocks.SocketMock();
      targetSocket.user.username = 'TargetUser';
      targetSocket.roomId = roomId;

      // act
      let result = sut.validUserInRoom(socket, targetSocket.user.username);

      // assert
      expect(result).toBe(false);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown user' });
    });

    it('should return false if user is not in the room', () => {
      // arrange
      var roomId = new ObjectId().valueOf();

      // acting user
      socket = new mocks.SocketMock();
      socket.roomId = roomId;

      // target user
      let targetSocket = new mocks.SocketMock();
      targetSocket.user.username = 'TargetUser';
      targetSocket.roomId = roomId;

      // log the user in
      mockGlobalIO.sockets.connected[targetSocket.id] = targetSocket;

      // act
      let result = sut.validUserInRoom(socket, targetSocket.user.username);

      // assert
      expect(result).toBe(false);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `You don't see ${targetSocket.user.username} here.` });
    });

    it('should return socket when user is in the room', () => {
      // arrange
      var roomId = new ObjectId().valueOf();

      // acting user
      socket = new mocks.SocketMock();
      socket.roomId = roomId;

      // target user
      let targetSocket = new mocks.SocketMock();
      targetSocket.user.username = 'TargetUser';
      targetSocket.roomId = roomId;

      // log the user in
      mockGlobalIO.sockets.connected[targetSocket.id] = targetSocket;

      // place the user in the room
      let sockets = {};
      sockets[targetSocket.id] = {};
      mockGlobalIO.sockets.adapter.rooms = {};
      mockGlobalIO.sockets.adapter.rooms[roomId] = {
        sockets,
      };

      // act
      let result = sut.validUserInRoom(socket, targetSocket.user.username);

      // assert
      expect(result.user.username).toBe(targetSocket.user.username);
      expect(result.user.id).toBe(targetSocket.user.id);
    });
  });

});
