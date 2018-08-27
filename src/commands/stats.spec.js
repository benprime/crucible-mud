import mocks from '../../spec/mocks';
import sut from './stats';

describe('stats', function () {

  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.mockClear());

  describe('execute', function () {

    test('should display stat block', function () {
      return sut.execute(socket.character).then((output) => {
        expect(output).not.toBeNull();
      });

    });

  });

});
