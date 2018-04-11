'use strict';

const mocks = require('../spec/mocks');
const socketUtil = require('../socketUtil');
const sut = require('../commands/telepathy');

describe('telepathy', function () {
  let socket;
  let otherSocket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123, username: 'TestUser' };
    otherSocket = new mocks.SocketMock();
    otherSocket.user = { roomId: 321, username: 'OtherUser' };
  });

  describe('execute', function () {

    it('should output messages when user is invalid', function () {
      // arrange
      const msg = 'This is a telepath message!';
      spyOn(socketUtil, 'getSocketByUsername').and.callFake(() => null);

      // act
      sut.execute(socket, 'Wrong', msg);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Invalid username.' });
    });

    it('should output messages when command is successful', function () {
      // arrange
      const msg = 'This is a telepath message!';
      spyOn(socketUtil, 'getSocketByUsername').and.callFake(() => otherSocket);

      // act
      sut.execute(socket, otherSocket.username, msg);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Telepath to OtherUser: This is a telepath message!' });
      expect(otherSocket.emit).toHaveBeenCalledWith('output', { message: 'TestUser telepaths: This is a telepath message!' });
    });

  });

});