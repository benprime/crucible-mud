const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const sut = SandboxedModule.require('./keys', {});

describe('keys', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    it('should display output when user has no keys', () => {
      // arrange
      socket.user.keys = [];
      const expectedString = '<span class=\'cyan\'>Key ring: </span><span class=\'silver\'>None.</span>';

      // act
      sut.execute(socket);

      // assert
      expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
      expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
    });

    it('should display user keys when user has keys', () => {
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
      expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
      expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
    });
  });

});
