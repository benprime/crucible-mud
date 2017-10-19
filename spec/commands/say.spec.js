'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/say');

describe('say', function () {
  let socket, otherSocket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123, username: 'TestUser' };
    otherSocket = new mocks.SocketMock();
    otherSocket.user = { roomId: 321, username: 'OtherUser' };
  });

  describe('execute', function () {
    it('should output messages to room', function () {

      // arrange
      const msg = 'This is a message.';

      // act
      sut.execute(socket, msg);

      // assert
      expect(socket.broadcast.to).toHaveBeenCalledWith(socket.user.roomId);
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'TestUser says \"This is a message.\"' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You say \"This is a message.\"' });

    });

    it('should escape tags for display', function () {

      // arrange
      const msg = '<Safety_First.com>';

      // act
      sut.execute(socket, msg);

      // assert
      expect(socket.broadcast.to).toHaveBeenCalledWith(socket.user.roomId);
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'TestUser says \"&lt;Safety_First.com&gt;\"' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You say \"&lt;Safety_First.com&gt;\"' });

    });

  });
});