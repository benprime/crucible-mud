const Item = require('../models/item');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockRoom;
let autocompleteResult;
const sut = SandboxedModule.require('./equip', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompleteTypesSpy').and.callFake(() => autocompleteResult),
    },
    '../models/item': Item,
    '../models/room': {
      getById: () => mockRoom,
    },
  },
});

describe('equip', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    mockRoom = mocks.getMockRoom();
  });

  describe('execute', () => {
    beforeEach(() => {
      socket.emit.calls.reset();
    });

    it('should do nothing when item is not in inventory', () => {
      autocompleteResult = null;
      sut.execute(socket, 'boot');

      expect(socket.emit).not.toHaveBeenCalled();
    });

    it('should output message when item is not equipable', () => {
      var sword = new Item();
      sword.equip = null;
      sword.name = 'sword';
      autocompleteResult = sword;
      sut.execute(socket, 'sword');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You cannot equip that!\n' });
    });

    it('should output message when item has invalid slot listing', () => {
      var finger = new Item();
      finger.equip = 'nose';
      finger.name = 'finger';
      autocompleteResult = finger;
      sut.execute(socket, 'finger');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Um, you want to put that where?!?!\n' });
    });

    it('should output message to specify which hand for hand related slots', () => {
      var ring = new Item();
      ring.equip = 'finger';
      ring.name = 'mood';
      autocompleteResult = ring;
      sut.execute(socket, 'mood');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Please specify which hand to equip the item\n' });
    });

    // good candidate for that test case custom runner
    it('should equip item of equip type and remove from backpack', () => {
      // test case for each type
    });

  });

});
