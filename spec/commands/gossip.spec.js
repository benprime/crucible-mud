'use strict';

//require('../globals');
const roomManager = require('../../roomManager');
const mocks = require('../mocks');
const SocketMock = new require('socket-io-mock');

const sut = require('../../commands/gossip');

describe('gossip', function () {
  let mockRoom;
  let roomManagerSpy;
  let socket;

  beforeAll(function () {
    mockRoom = mocks.getMockRoom();
    roomManagerSpy = spyOn(roomManager, 'getRoomById').and.callFake(() => mockRoom);
    socket = new SocketMock();
    socket.user = { roomId: 123 };
  });

  describe('execute', function () {


    it('should', function () {
      // arrange
      const msg = "This is a gossiped message!";
      var results = [];

      // passing a spy to the mock callback (it has both room and message)
      var spy = jasmine.createSpy();
      socket.onEmit('output', spy);

      // act
      sut.execute(socket, msg);

      // assert
      expect(spy).toHaveBeenCalledWith({ message: `${socket.user.username} gossips "This is a gossiped message!"` }, undefined);
      expect(spy).toHaveBeenCalledWith({ message: 'You gossip "This is a gossiped message!"' }, undefined);
    });

  });

});