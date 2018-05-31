'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockGlobalIO = new mocks.IOMock();
const sut = SandboxedModule.require('./who', {
  globals: {io:mockGlobalIO},
});

describe('who', function () {
  let socket;
  let t1, t2;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    t1 = new mocks.SocketMock();
    t2 = new mocks.SocketMock();
    t1.id = '1';
    t2.id = '2';
    t1.user.username = 'Test1';
    t2.user.username = 'Test2';
    mockGlobalIO.reset();
    mockGlobalIO.sockets.connected = {};
    mockGlobalIO.sockets.connected[t1.id] = t1;
    mockGlobalIO.sockets.connected[t2.id] = t2;
  });

  describe('execute', function () {
    it('should display online users', function () {
      sut.execute(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan"> -=- 2 Players Online -=-</span><br /><div class="mediumOrchid">Test1<br />Test2</div>' });
    });
  });

});
