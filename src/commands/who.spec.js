'use strict';

const mocks = require('../../mocks');
const sut = require('../commands/who');

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
    global.io = new mocks.IOMock();
    global.io.sockets.connected = {};
    global.io.sockets.connected[t1.id] = t1;
    global.io.sockets.connected[t2.id] = t2;
  });

  describe('execute', function () {
    it('should display online users', function () {
      sut.execute(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan"> -=- 2 Players Online -=-</span><br /><div class="mediumOrchid">Test1<br />Test2</div>' });
    });
  });

});
