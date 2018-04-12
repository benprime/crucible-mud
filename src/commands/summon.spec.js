'use strict';

const mocks = require('../../mocks');
const sut = require('../commands/summon');
const lookCmd = require('../commands/look');
const socketUtil = require('../core/socketUtil');

describe('summon', function () {
  let socket;
  let otherSocket;
  let currentRoom, otherRoom;

  beforeEach(function () {
    currentRoom = mocks.getMockRoom();
    currentRoom.name = 'OLD';
    otherRoom = mocks.getMockRoom();
    otherRoom.name = 'NEW';
    socket = new mocks.SocketMock();
    socket.user.roomId = currentRoom.id;
    socket.user.username = 'TestUser';
    otherSocket = new mocks.SocketMock();
    otherSocket.user.roomId = otherRoom.id;
    otherSocket.user.username = 'OtherUser';
  });

  describe('execute', function () {
    it('should output message when user is not found', function() {
      spyOn(socketUtil, 'getSocketByUsername').and.callFake(() => null);
      sut.execute(socket, 'Wrong');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Player not found.' });
    });

    it('should join target user to admin room and leave current room', function() {
      // arrange
      otherSocket.user.roomId = otherRoom.id;
      spyOn(socketUtil, 'getSocketByUsername').and.callFake(() => otherSocket);
      spyOn(lookCmd, 'execute').and.callFake(() => null);

      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(otherSocket.leave).toHaveBeenCalledWith(otherRoom._id);
      expect(otherSocket.join).toHaveBeenCalledWith(currentRoom._id);
    });

    it('should update target user room id and save user to database', function() {
      // arrange
      otherSocket.user.roomId = otherRoom.id;
      spyOn(socketUtil, 'getSocketByUsername').and.callFake(() => otherSocket);
      spyOn(lookCmd, 'execute').and.callFake(() => null);

      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(otherSocket.user.roomId).toEqual(currentRoom._id);
      expect(otherSocket.user.save).toHaveBeenCalled();
    });

    it('should output messages when command successful', function() {
      // arrange
      otherSocket.user.roomId = otherRoom.id;
      spyOn(socketUtil, 'getSocketByUsername').and.callFake(() => otherSocket);
      spyOn(lookCmd, 'execute').and.callFake(() => null);

      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(otherSocket.emit).toHaveBeenCalledWith('output', { message: 'You were summoned to TestUser\'s room!' });
      expect(otherSocket.broadcast.to(otherSocket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'OtherUser appears out of thin air!' });
    });

    it('should be an admin command', function() {
      expect(sut.admin).toBe(true);
    });
  });
});
