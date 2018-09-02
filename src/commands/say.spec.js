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
      expect.assertions(2);

      // act
      return sut.execute(socket.character, msg).then(() => {
        // assert
        expect(socket.character.toRoom).toHaveBeenCalledWith('TestUser says "<span class="silver">This is a message.</span>"', [socket.character.id]);
        expect(socket.character.output).toHaveBeenCalledWith('You say "<span class="silver">This is a message.</span>"');
      });
    });

    test('should escape tags for display', () => {

      // arrange
      const msg = '<Safety_First.com>';
      expect.assertions(2);

      // act
      return sut.execute(socket.character, msg).then(() => {
        // assert
        expect(socket.character.toRoom).toHaveBeenCalledWith('TestUser says "<span class="silver">&lt;Safety_First.com&gt;</span>"', [socket.character.id]);
        expect(socket.character.output).toHaveBeenCalledWith('You say "<span class="silver">&lt;Safety_First.com&gt;</span>"');
      });
    });

  });
});
