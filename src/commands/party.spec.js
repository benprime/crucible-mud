import mocks from '../../spec/mocks';
import sut from './party';
import { mockGetFollowingCharacters } from '../core/socketUtil';

global.io = new mocks.IOMock();

jest.mock('../core/socketUtil');

describe('party', () => {
  let socket;
  let t1;
  let t2;

  beforeAll(() => {
    socket = new mocks.SocketMock();

    t1 = new mocks.SocketMock();
    t1.character.name = 'Test1';

    t2 = new mocks.SocketMock();
    t2.character.name = 'Test2';

    mockGetFollowingCharacters.mockReturnValue([t1.character, t2.character]);
  });

  describe('execute', () => {
    test('should display party members', () => {
      return sut.execute(socket.character).then(response => {
        const expected = 'The following people are in your party:\nTest1\nTest2\nTestUser (Leader)\n';

        expect(response).toEqual(expected);
      });

    });
  });
});
