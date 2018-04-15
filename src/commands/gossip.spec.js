'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockGlobalIO = new mocks.IOMock();
const sut = SandboxedModule.require('./gossip', {
  globals: {io:mockGlobalIO},
});

describe('gossip', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    mockGlobalIO.reset();
  });

  describe('execute', function () {

    it('should call emit to correct gossip channel', function () {
      // arrange
      const msg = 'This is a gossiped message!';

      // act
      sut.execute(socket, msg);

      // assert
      expect(mockGlobalIO.to).toHaveBeenCalledWith('gossip');
      expect(mockGlobalIO.to('gossip').emit).toHaveBeenCalledWith('output', { message: '<span class="silver">TestUser gossips: </span><span class="mediumOrchid">This is a gossiped message!</span>' });
    });

  });

});
