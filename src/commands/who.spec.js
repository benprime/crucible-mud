import mocks from '../../spec/mocks';
import sut from './who';

global.io = new mocks.IOMock();

describe('who', () => {
  let socket;
  let t1;
  let t2;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    t1 = new mocks.SocketMock();
    t2 = new mocks.SocketMock();
    t1.id = '1';
    t2.id = '2';
    t1.user.username = 'Test1';
    t2.user.username = 'Test2';
    global.io.reset();
    global.io.sockets.connected = {};
    global.io.sockets.connected[t1.id] = t1;
    global.io.sockets.connected[t2.id] = t2;
  });

  describe('execute', () => {
    test('should display online users', () => {
      sut.execute(socket);

      expect(socket.emit).toBeCalledWith('output', { message: '<span class="cyan"> -=- 2 Players Online -=-</span><br /><div class="mediumOrchid">Test1<br />Test2</div>' });
    });
  });
});
