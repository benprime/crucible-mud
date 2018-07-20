'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const sut = SandboxedModule.require('./list', {});

describe('list', () => {
  let socket;
  let itemCatalog;
  let mobCatalog;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    itemCatalog = {
      catalog: [
        {
          type: 'key',
          displayName: 'key 1 display name',
          name: 'key 1',
        },
        {
          type: 'key',
          displayName: 'key 2 display name',
          name: 'key 2',
        },
        {
          type: 'item',
          displayName: 'item 1 display name',
          name: 'item 1',
        },
        {
          type: 'item',
          displayName: 'item 2 display name',
          name: 'item 2',
        },
      ],
    };
    mobCatalog = {
      catalog: [
        {
          type: 'mob',
          displayName: 'mob 1 display name',
          name: 'mob 1',
        },
      ],
    };
  });

  describe('execute', () => {
    it('should lists mob catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th><th>Display Name</th></tr><tr><td>mob 1</td><td>mob 1 display name</td></tr></table>';

      // act
      sut.execute(socket, mobCatalog, 'mob');

      // assert
      expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
      expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
    });

    it('should lists item catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th><th>Display Name</th></tr><tr><td>item 1</td><td>item 1 display name</td></tr>\n<tr><td>item 2</td><td>item 2 display name</td></tr></table>';

      // act
      sut.execute(socket, itemCatalog, 'item');

      // assert
      expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
      expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
    });

    it('should list key catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th><th>Display Name</th></tr><tr><td>key 1</td><td>key 1 display name</td></tr>\n<tr><td>key 2</td><td>key 2 display name</td></tr></table>';

      // act
      sut.execute(socket, itemCatalog, 'key');

      // assert
      expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
      expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
    });

  });

  it('should be an admin command', () => {
    expect(sut.admin).toBe(true);
  });
});
