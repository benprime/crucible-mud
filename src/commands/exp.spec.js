import mocks from '../../spec/mocks';
import User from '../models/user';
import sut from './exp';

describe('exp', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.user = new User();
  });

  describe('execute', () => {
    test('should display the current experience level, xp, and next level', () => {
      return sut.execute(socket.character).then(response => {
        expect(response).toContain('<span class=\'cyan\'>XP: </span><span class=\'silver\'>undefined</span>\n<span class=\'cyan\'>Level: </span><span class=\'silver\'>undefined</span>\n<span class=\'cyan\'>Next: </span><span class=\'silver\'>NaN</span>\n');
      });

    });
  });

});
