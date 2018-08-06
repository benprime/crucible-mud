import mocks from '../../spec/mocks';
import sut from './keys';

describe('keys', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    test('should display output when user has no keys', () => {
      // arrange
      socket.user.keys = [];
      const expectedString = '<span class=\'cyan\'>Key ring: </span><span class=\'silver\'>None.</span>';

      // act
      sut.execute(socket);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', {message: expectedString});
    });

    test('should display user keys when user has keys', () => {
      // arrange
      socket.user.keys = [
        { displayName: 'KeyOne' },
        { displayName: 'KeyTwo' },
        { displayName: 'KeyThree' },
      ];
      const expectedString = '<span class=\'cyan\'>Key ring: </span><span class=\'silver\'>KeyOne, KeyTwo, KeyThree</span>';

      // act
      sut.execute(socket);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', {message: expectedString});
    });
  });

});
