
import { mockAutocompleteTypes } from '../core/autocomplete';

import Item from '../models/item';
import mocks from '../../spec/mocks';
import sut from './equip';

//jest.mock('../models/room');
jest.mock('../core/autocomplete');

describe('equip', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    test('should do nothing when item is not in inventory', () => {
      mockAutocompleteTypes.mockReturnValueOnce(null);

      sut.execute(socket, 'boot');

      expect(socket.emit).not.toHaveBeenCalled();
    });

    test('should output message when item is not equipable', () => {
      const sword = new Item();
      sword.equip = null;
      sword.name = 'sword';
      mockAutocompleteTypes.mockReturnValueOnce(sword);

      sut.execute(socket, 'sword');

      expect(socket.emit).toBeCalledWith('output', { message: 'You cannot equip that!\n' });
    });

    test('should output message when item has invalid slot listing', () => {
      const finger = new Item();
      finger.equip = 'nose';
      finger.name = 'finger';
      mockAutocompleteTypes.mockReturnValueOnce(finger);

      sut.execute(socket, 'finger');

      expect(socket.emit).toBeCalledWith('output', { message: 'Um, you want to put that where?!?!\n' });
    });

    test('should output message to specify which hand for hand related slots', () => {
      const ring = new Item();
      ring.equip = 'finger';
      ring.name = 'mood';
      mockAutocompleteTypes.mockReturnValueOnce(ring);

      sut.execute(socket, 'mood');

      expect(socket.emit).toBeCalledWith('output', { message: 'Please specify which hand to equip the item\n' });
    });

    // good candidate for that test case custom runner
    test('should equip item of equip type and remove from backpack', () => {
      // test case for each type
    });

  });

});
