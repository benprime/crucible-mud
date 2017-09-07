'use strict';

const roomManager = require('../../roomManager');
const mocks = require('../mocks');

const sut = require('../../commands/gossip');

describe('gossip', function () {
  let mockRoom;
  let roomManagerSpy;
  let socket;

  beforeAll(function () {
    mockRoom = mocks.getMockRoom();
    roomManagerSpy = spyOn(roomManager, 'getRoomById').and.callFake(() => mockRoom);
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123 };
    global.io = new mocks.IOMock();
  });

  describe('execute', function () {

    it('should', function () {
      // arrange
      const msg = "This is a gossiped message!";
      var results = [];

      // act
      sut.execute(socket, msg);

      // assert
      expect(global.io.to().emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} gossips "This is a gossiped message!"` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You gossip "This is a gossiped message!"' });
    });

  });

});