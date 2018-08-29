import mocks from '../../spec/mocks';
import sut from './socketUtil';
import { Types } from 'mongoose';
const { ObjectId } = Types;

global.io = new mocks.IOMock();


describe('socketUtil', () => {

  describe('roomMessage', () => {
    let room;
    let socket;

    beforeAll(() => {
      global.io.reset();
      room = mocks.getMockRoom();
      socket = new mocks.SocketMock();
    });

    test('does not send messages when roomid is invalid', () => {
      // arrange
      const message = 'test message';
      const exclude = null;
      let sockets = {};
      sockets[socket.id] = socket;
      global.io.sockets.connected[socket.id] = socket;
      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms[room.id] = {
        sockets,
      };

      // act
      sut.roomMessage('invalid room id', message, exclude);

      // arrange
      expect(socket.emit).not.toHaveBeenCalled();
    });

    test('should send message to every socket in the room', () => {
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
        sockets,
      };

      // act
      sut.roomMessage(room.id, message, exclude);

      // arrange
      expect(socketA.emit).toHaveBeenCalled();
      expect(socketB.emit).toHaveBeenCalled();
      expect(socketC.emit).toHaveBeenCalled();
    });

    test('should exclude sockets passed in the exclude array', () => {
      // arrange
      const socketA = new mocks.SocketMock();
      const socketB = new mocks.SocketMock();
      const socketC = new mocks.SocketMock();
      const message = 'test message';
      const exclude = [
        socketB.character.id.toString(),
        socketC.character.id.toString(),
      ];
      let sockets = {};
      sockets[socketA.id] = socketA;
      sockets[socketB.id] = socketB;
      sockets[socketC.id] = socketC;

      global.io.sockets.connected[socketA.id] = socketA;
      global.io.sockets.connected[socketB.id] = socketB;
      global.io.sockets.connected[socketC.id] = socketC;

      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms[room.id] = {
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

  describe('getSocketByCharacterId', () => {
    let socket;

    beforeEach(() => {
      global.io.reset();
    });

    test('returns socket when username found in connected sockets', () => {
      // arrange
      socket = new mocks.SocketMock();
      global.io.sockets.connected[socket.id] = socket;

      // act
      const result = sut.getSocketByCharacterId(socket.character.id);

      // assert
      expect(result).toBe(socket);
    });

    test('returns null when username not found in connected sockets', () => {
      // act
      const result = sut.getSocketByCharacterId('unknown username');

      // assert
      expect(result).toBeNull();
    });

  });

  describe('getSocketByUserId', () => {
    let socket;

    test('returns socket when userId found in connected sockets', () => {
      // arrange
      global.io.reset();
      socket = new mocks.SocketMock();
      global.io.sockets.connected[socket.id] = socket;

      // act
      const result = sut.getSocketByUserId(socket.user.id);

      // assert
      expect(result).toBe(socket);
    });

    test('returns null when userId not found in connected sockets', () => {
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
      global.io.reset();
      room = mocks.getMockRoom();
    });

    test('should return an empty array when no sockets exist in the room', () => {
      let result = sut.getRoomSockets('room with no sockets');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    test('should return an array of sockets when the room is populated with users', () => {
      global.io.sockets.adapter.rooms[room.id] = {
        sockets: [
          {},
          {},
        ],
      };

      let result = sut.getRoomSockets(room.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });
  });

  describe('getFollowingCharacters', () => {
    beforeEach(() => {
      global.io.reset();
    });

    test('should return all sockets where leader matches', () => {
      // arrange
      const leaderId = new ObjectId().valueOf();

      const follower1 = new mocks.SocketMock('follower1');
      const follower2 = new mocks.SocketMock('follower2');
      const follower3 = new mocks.SocketMock('follower3');

      follower1.character.leader = leaderId;
      follower2.character.leader = leaderId;
      follower3.character.leader = leaderId;

      const nonFollower1 = new mocks.SocketMock('nonFollower1');
      const nonFollower2 = new mocks.SocketMock('nonFollower2');
      const nonFollower3 = new mocks.SocketMock('nonFollower3');

      global.io.sockets.connected[follower1.id] = follower1;
      global.io.sockets.connected[follower2.id] = follower2;
      global.io.sockets.connected[follower3.id] = follower3;
      global.io.sockets.connected[nonFollower1.id] = nonFollower1;
      global.io.sockets.connected[nonFollower2.id] = nonFollower2;
      global.io.sockets.connected[nonFollower3.id] = nonFollower3;

      // act
      const result = sut.getFollowingCharacters(leaderId);

      // assert
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(follower1.character);
      expect(result[1]).toBe(follower2.character);
      expect(result[2]).toBe(follower3.character);
    });
  });

});