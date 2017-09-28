'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/keys');

describe('keys', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should display output when user has no keys', function () {
      // arrange
      socket.user.keys = [];
      const expectedString = '<span class=\'cyan\'>Key ring: </span><span class=\'silver\'>None.</span>';

      // act
      sut.execute(socket);

      // assert
      expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
      expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
    });

    it('should display user keys when user has keys', function () {
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