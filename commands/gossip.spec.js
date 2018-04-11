'use strict';

const mocks = require('../spec/mocks');
const sut = require('../commands/gossip');

describe('gossip', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    global.io = new mocks.IOMock();
  });

  describe('execute', function () {

    it('should call emit to correct gossip channel', function () {
      // arrange
      const msg = 'This is a gossiped message!';

      // act
      sut.execute(socket, msg);

      // assert
      expect(global.io.to).toHaveBeenCalledWith('gossip');
      expect(global.io.to('gossip').emit).toHaveBeenCalledWith('output', { message: '<span class="silver">TestUser gossips: </span><span class="mediumOrchid">This is a gossiped message!</span>' });
    });

  });

});
