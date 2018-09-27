import mocks from '../../../../spec/mocks';
import sut from './partyAction';
import { mockGetFollowers } from '../../../core/socketUtil';

global.io = new mocks.IOMock();

jest.mock('../../../core/socketUtil');

describe('party', () => {
  let socket;
  let t1;
  let t2;


  describe('execute', () => {
    describe('two person party', () => {
      beforeAll(() => {
        socket = new mocks.SocketMock();

        t1 = new mocks.SocketMock();
        t1.character.name = 'Test1';

        t2 = new mocks.SocketMock();
        t2.character.name = 'Test2';

        mockGetFollowers.mockReturnValue([t1.character, t2.character]);
      });

      test('should display party members when command run by leader', () => {
        expect.assertions(1);
        return sut.execute(socket.character).then(() => {
          const expected = 'The following people are in your party:\nTestUser (Leader)\nTest1\nTest2\n';

          expect(socket.character.output).toHaveBeenCalledWith(expected);
        });

      });

      test('should display party members when command run by follower', () => {
        expect.assertions(1);
        return sut.execute(socket.character).then(() => {
          const expected = 'The following people are in your party:\nTestUser (Leader)\nTest1\nTest2\n';

          expect(socket.character.output).toHaveBeenCalledWith(expected);
        });
      });
    });

    test('should display message when user not in party', () => {
      mockGetFollowers.mockReturnValue([]);
      expect.assertions(1);
      const noPartysocket = new mocks.SocketMock();
      return sut.execute(noPartysocket.character).catch(() => {
        const expected = 'You are not in a party.';

        expect(noPartysocket.character.output).toHaveBeenCalledWith(expected);
      });
    });
  });
});
