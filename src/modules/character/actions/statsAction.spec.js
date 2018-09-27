import mocks from '../../../../spec/mocks';
import sut from './statsAction';

describe('stats', function () {

  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.mockClear());

  describe('execute', function () {

    test('should display stat block', function () {
      expect.assertions(1);
      return sut.execute(socket.character).then((output) => {
        expect(output).not.toBeNull();
      });

    });

  });

});
