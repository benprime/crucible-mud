const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let diceRoll = jasmine.createSpy();
const sut = SandboxedModule.require('./roll', {
  requires: {
    '../core/dice': {
      roll: diceRoll,
    },
  },
});

describe('roll', () => {

  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    socket.emit.calls.reset();
    diceRoll.calls.reset();
  });

  describe('execute', () => {
    it('without die type should display Action Die results', () => {

      diceRoll.and.returnValue(1);

      sut.execute(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Action Die Roll Result:  1<br />' });
    });

    it('with die type should display die type results', () => {

      diceRoll.and.returnValue(2);

      sut.execute(socket, '1d4');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '1d4 Roll Result:  2<br />' });
    });
  });
});
