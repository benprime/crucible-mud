import { mockAutocompleteTypes } from '../core/autocomplete';
import Item from '../models/item';
import mocks from '../../spec/mocks';
import sut from './unequip';

jest.mock('../models/room');
jest.mock('../core/autocomplete');

describe('unequip', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => {
    mockAutocompleteTypes.mockClear();
  });

  describe('execute', () => {
    test('should output message when item is not equipped', () => {
      mockAutocompleteTypes.mockReturnValueOnce(null);

      expect.assertions(1);
      return sut.execute(socket.character, 'monocle').catch(response => {
        expect(response).toEqual('You don\'t have that equipped.\n');
      });

    });

    test('should output message to specify which hand for hand related slots', () => {
      const ring = new Item();
      ring.equip = 'finger';
      ring.name = 'diamond';
      mockAutocompleteTypes.mockReturnValueOnce({ item: ring });

      socket.character.equipSlots.fingerMain = ring;

      expect.assertions(1);
      return sut.execute(socket.character, 'diamond').catch(response => {
        expect(response).toEqual('Please specify which hand to unequip the item from\n');
      });

    });

    // good candidate for that test case custom runner
    test('should unequip item put it into backpack', () => {
      // test case for each type
    });

  });

});
