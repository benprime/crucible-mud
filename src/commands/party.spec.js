import mocks from '../../spec/mocks';
import sut from './party';

global.io = new mocks.IOMock();

describe('party', () => {
  let socket;
  let t1;
  let t2;

  beforeAll(() => {
    socket = new mocks.SocketMock();

    t1 = new mocks.SocketMock();
    t1.id = '1';
    t1.user.username = 'Test1';
    t1.leader = socket.id;

    t2 = new mocks.SocketMock();
    t2.id = '2';
    t2.user.username = 'Test2';
    t2.leader = socket.id;

    global.io.reset();
    global.io.sockets.connected = {};
    global.io.sockets.connected[t1.id] = t1;
    global.io.sockets.connected[t2.id] = t2;
  });

  describe('execute', () => {
    test('should display party members', () => {
      sut.execute(socket);

      const expected = 'The following people are in your party:\nTest1\nTest2\nTestUser (Leader)\n';
      expect(socket.emit).toBeCalledWith('output', { message: expected });
    });
  });
});
