import mocks from '../../spec/mocks';
import sut from './say';

describe('say', () => {
  let socket;
  let otherSocket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123, username: 'TestUser' };
    otherSocket = new mocks.SocketMock();
    otherSocket.user = { roomId: 321, username: 'OtherUser' };
  });

  describe('execute', () => {
    test('should output messages to room', () => {

      // arrange
      const msg = 'This is a message.';

      // act
      sut.execute(socket, msg);

      // assert
      expect(socket.broadcast.to).toBeCalledWith(socket.user.roomId);
      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser says "This is a message."' });
      expect(socket.emit).toBeCalledWith('output', { message: 'You say "This is a message."' });

    });

    test('should escape tags for display', () => {

      // arrange
      const msg = '<Safety_First.com>';

      // act
      sut.execute(socket, msg);

      // assert
      expect(socket.broadcast.to).toBeCalledWith(socket.user.roomId);
      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser says "&lt;Safety_First.com&gt;"' });
      expect(socket.emit).toBeCalledWith('output', { message: 'You say "&lt;Safety_First.com&gt;"' });

    });

  });
});
