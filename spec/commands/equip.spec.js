'use strict';

const Room = require('../../models/room');
const Item = require('../../models/item');
const mocks = require('../mocks');
const sut = require('../../commands/equip');
const autocomplete = require('../../autocomplete');

describe('equip', function () {
  let socket;
  let room;
  let autocompleteResult;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(Room, 'getById').and.callFake(() => room);
    spyOn(autocomplete, 'autocompleteTypes').and.callFake(() => autocompleteResult);
  });

  beforeEach(function () {
    autocomplete.autocompleteTypes.calls.reset();
  });

  describe('execute', function () {
    it('should do nothing when item is not in inventory', function () {
      autocompleteResult = null;
      sut.execute(socket, 'boot');
      expect(socket.emit).not.toHaveBeenCalled();
    });

    it('should output message when item is not equipable', function () {
      var sword = new Item();
      sword.equip = null;
      sword.name = 'sword';
      autocompleteResult = sword;
      sut.execute(socket, 'sword');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You cannot equip that!\n' });
    });

    it('should output message when item has invalid slot listing', function () {
      var finger = new Item();
      finger.equip = 'nose';
      finger.name = 'finger';
      autocompleteResult = finger;
      sut.execute(socket, 'finger');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Um, you want to put that where?!?!\n' });
    });

    it('should output message to specify which hand for hand related slots', function () {
      var ring = new Item();
      ring.equip = 'finger';
      ring.name = 'mood';
      autocompleteResult = ring;
      sut.execute(socket, 'mood');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Please specify which hand to equip the item\n' });
    });

    // good candidate for that test case custom runner
    it('should equip item of equip type and remove from backpack', function () {
      // test case for each type
    });

  });

});