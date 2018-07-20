const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const sut = SandboxedModule.require('./say', {});

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
    it('should output messages to room', () => {

      // arrange
      const msg = 'This is a message.';

      // act
      sut.execute(socket, msg);

      // assert
      expect(socket.broadcast.to).toHaveBeenCalledWith(socket.user.roomId);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser says "This is a message."' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You say "This is a message."' });

    });

    it('should escape tags for display', () => {

      // arrange
      const msg = '<Safety_First.com>';

      // act
      sut.execute(socket, msg);

      // assert
      expect(socket.broadcast.to).toHaveBeenCalledWith(socket.user.roomId);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser says "&lt;Safety_First.com&gt;"' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You say "&lt;Safety_First.com&gt;"' });

    });

  });
});
