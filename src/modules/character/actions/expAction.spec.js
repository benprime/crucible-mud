import mocks from '../../../../spec/mocks';
import User from '../../../models/user';
import sut from './expAction';

describe('exp', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.user = new User();
  });

  describe('execute', () => {
    test('should display the current experience level, xp, and next level', () => {
      const result = sut.execute(socket.character);
      expect(result).toBe(true);
      expect(socket.character.output).toHaveBeenCalledWith('<span class=\'cyan\'>XP: </span><span class=\'silver\'>undefined</span>\n<span class=\'cyan\'>Level: </span><span class=\'silver\'>undefined</span>\n<span class=\'cyan\'>Next: </span><span class=\'silver\'>NaN</span>\n');
    });
  });

});
