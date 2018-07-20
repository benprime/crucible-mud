'use strict';

const Room = require('../models/room');
const Item = require('../models/item');
const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const sut = SandboxedModule.require('./unequip', {
  requires: {
    '../core/autocomplete': {},
    '../models/room': {},
  },
});
const autocomplete = require('../core/autocomplete');

describe('unequip', () => {
  let socket;
  let room;
  let autocompleteResult;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(Room, 'getById').and.callFake(() => room);
    spyOn(autocomplete, 'autocompleteTypes').and.callFake(() => autocompleteResult);
  });

  beforeEach(() => {
    autocomplete.autocompleteTypes.calls.reset();
  });

  describe('execute', () => {
    it('should output message when item is not equipped', () => {
      autocompleteResult = null;
      sut.execute(socket, 'monocle');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t have that equipped.\n' });
    });

    it('should output message to specify which hand for hand related slots', () => {
      var ring = new Item();
      ring.equip = 'finger';
      ring.name = 'diamond';
      autocompleteResult = ring;
      socket.user.equipSlots.fingerMain = ring;
      sut.execute(socket, 'diamond');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Please specify which hand to unequip the item from\n' });
    });

    // good candidate for that test case custom runner
    it('should unequip item put it into backpack', () => {
      // test case for each type
    });

  });

});
