import { mockAutocompleteMultiple } from '../core/autocomplete';
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
    mockAutocompleteMultiple.mockClear();
  });

  describe('execute', () => {
    test('should output message when item is not equipped', () => {
      mockAutocompleteMultiple.mockReturnValueOnce(null);

      expect.assertions(1);
      return sut.execute(socket.character, 'monocle').catch(response => {
        expect(response).toEqual('You don\'t have that equipped.\n');
      });

    });

    // I don't think this is necessary... you are either wearing it or you are not.
    xtest('should output message to specify which hand for hand related slots', () => {
      const ring = new Item();
      ring.equip = 'finger';
      ring.name = 'diamond';
      mockAutocompleteMultiple.mockReturnValueOnce({ item: ring });

      socket.character.equipSlots.fingerMain = ring;

      expect.assertions(1);
      return sut.execute(socket.character, 'diamond').catch(response => {
        expect(response).toEqual('Please specify which hand to unequip the item from\n');
      });

    });

    // good candidate for that test case custom runner
    xtest('should unequip item put it into backpack', () => {
      // test case for each type
    });

  });

});
