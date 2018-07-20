const SandboxedModule = require('sandboxed-module');
const mocks = require('../../spec/mocks.js');

let mockRoom;
let autocompleteResult;
const sut = SandboxedModule.require('./attack', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompleteTypesSpy').and.callFake(() => autocompleteResult),
    },
    '../models/room': {
      getById: () => mockRoom,
    },
  },
});

describe('attack', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    mockRoom = mocks.getMockRoom();
  });

  beforeEach(() => {
    socket.reset();
  });

  describe('dispatch triggers execute', () => {
    let executeSpy;

    beforeAll(() => {
      executeSpy = spyOn(sut, 'execute');
    });

    it('on short pattern', () => {
      autocompleteResult = 'thing';
      sut.dispatch(socket, ['a th', 'thing']);

      expect(executeSpy).toHaveBeenCalledWith(socket, autocompleteResult);
    });
  });

  describe('execute', () => {
    beforeAll(() => {
      socket = new mocks.SocketMock();
      socket.user.username = 'aName';
      socket.user.roomId = mockRoom.id;
    });

    it('should set state and emit output when valid target found', () => {
      autocompleteResult = {
        item: {
          id: 123,
          displayName: 'a thing!',
        },
        type: 'mob',
      };
      sut.execute(socket, 'thing');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      expect(socket.broadcast.to(socket.user.roomId.toString()).emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} moves to attack ${autocompleteResult.displayName}!` });
      expect(socket.user.attackTarget).toBe(autocompleteResult.item.id);
    });

    it('should set state and emit output when no target found', () => {
      autocompleteResult = null;
      sut.execute(socket, 'thing');

      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.user.attackTarget).toBeFalsy();
    });
  });
});
