'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/telepathy');

describe('telepathy', function () {
  let socket;
  let otherSocket;
  let oFunc;

  beforeAll(function () {    
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123, username: 'TestUser' };
    otherSocket = new mocks.SocketMock();
    otherSocket.user = { roomId: 321, username: 'OtherUser' };
    oFunc = global.GetSocketByUsername;
    spyOn(global,"GetSocketByUsername").and.callFake(()=>otherSocket);
  });

  afterAll(function () {    
    global.GetSocketByUsername = oFunc;
  });

  describe('execute', function () {

    it('should', function () {
      // arrange
      const msg = "This is a telepath message!";

      // act
      sut.execute(socket, otherSocket.username, msg);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Telepath to OtherUser: This is a telepath message!' });
      expect(otherSocket.emit).toHaveBeenCalledWith('output', { message: 'TestUser telepaths: This is a telepath message!' });
    });

  });

});