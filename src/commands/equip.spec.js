
import { mockAutocompleteMultiple } from '../core/autocomplete';

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
      mockAutocompleteMultiple.mockReturnValueOnce(null);

      return sut.execute(socket.character, 'boot').catch(output => {
        expect(output).toBe('item is not in inventory.');
      });

    });

    test('should output message when item is not equipable', () => {
      const sword = new Item();
      sword.equip = null;
      sword.name = 'sword';
      mockAutocompleteMultiple.mockReturnValueOnce({ item: sword });

      return sut.execute(socket.character, 'sword').catch(output => {
        expect(output).toEqual('You cannot equip that!\n');
      });
    });

    test('should output message when item has invalid slot listing', () => {
      const finger = new Item();
      finger.equip = 'nose';
      finger.name = 'finger';
      mockAutocompleteMultiple.mockReturnValueOnce({ item: finger });

      return sut.execute(socket.character, 'finger').catch(output => {
        expect(output).toEqual('Um, you want to put that where?!?!\n');

      });

    });

    test('should output message to specify which hand for hand related slots', () => {
      const ring = new Item();
      ring.equip = 'finger';
      ring.name = 'mood';
      mockAutocompleteMultiple.mockReturnValueOnce({ item: ring });

      return sut.execute(socket.character, 'mood').catch(output => {
        expect(output).toEqual('Please specify which hand to equip the item\n');
      });

    });

    // good candidate for that test case custom runner
    test('should equip item of equip type and remove from backpack', () => {
      // test case for each type
    });

  });

});
