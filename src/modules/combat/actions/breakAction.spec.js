import mocks from '../../../../spec/mocks';
import sut from './breakAction';

describe('break', () => {
  let socket;

  describe('execute', () => {

    test('should set appropriate socket state variables when combat underway', () => {
      // arrange
      socket = new mocks.SocketMock();
      socket.character.attackTarget = 1;

      // act
      const result = sut.execute(socket.character);

      // assert
      expect(result).toBe(true);
      expect(socket.character.toRoom).toHaveBeenCalledWith('TestUser breaks off his attack.', [socket.character.id]);
      expect(socket.character.output).toHaveBeenCalledWith('<span class="olive">*** Combat Disengaged ***</span>');
    });

    test('should not emit messages if combat is not underway', () => {
      // arrange
      socket = new mocks.SocketMock();

      // act
      const result = sut.execute(socket.character);
      
      // assert
      expect(result).toBe(true);
      expect(socket.character.output).not.toHaveBeenCalled();
      expect(socket.character.toRoom).not.toHaveBeenCalled();
    });
  });

});