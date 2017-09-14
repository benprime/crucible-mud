'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/gossip');

describe('gossip', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    global.io = new mocks.IOMock();
    socket.user = { roomId: 123, username: 'TestUser' };
  });

  describe('execute', function () {

    it('should', function () {
      // arrange
      const msg = "This is a gossiped message!";

      // act
      sut.execute(socket, msg);

      // assert
      expect(global.io.to().emit).toHaveBeenCalledWith('output', { message: '<span class="silver">TestUser gossips: </span><span class="mediumOrchid">This is a gossiped message!</span>' });
    });

  });

});