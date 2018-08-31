import mocks from '../../spec/mocks';
import sut from './break';

describe('break', () => {
  let socket;

  describe('execute', () => {

    test('should set appropriate socket state variables when combat underway', () => {
      // arrange
      socket = new mocks.SocketMock();
      socket.character.attackTarget = 1;
      expect.assertions(2);

      // act
      return sut.execute(socket.character).then(response => {
        // assert
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'TestUser breaks off his attack.', exclude: [socket.character.id] });
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: '<span class="olive">*** Combat Disengaged ***</span>' });
      });
    });

    test('should not emit messages if combat is not underway', () => {
      // arrange
      socket = new mocks.SocketMock();
      expect.assertions(2);

      // act
      return sut.execute(socket.character).then(response => {
        // assert
        expect(response.charMessages).toHaveLength(0);
        expect(response.roomMessages).toHaveLength(0);
      });


    });
  });

});