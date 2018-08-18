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

      sut.execute(socket, 'monocle');

      expect(socket.emit).toBeCalledWith('output', { message: 'You don\'t have that equipped.\n' });
    });

    test('should output message to specify which hand for hand related slots', () => {
      const ring = new Item();
      ring.equip = 'finger';
      ring.name = 'diamond';
      mockAutocompleteTypes.mockReturnValueOnce({ item: ring });

      socket.character.equipSlots.fingerMain = ring;

      sut.execute(socket, 'diamond');

      expect(socket.emit).toBeCalledWith('output', { message: 'Please specify which hand to unequip the item from\n' });
    });

    // good candidate for that test case custom runner
    test('should unequip item put it into backpack', () => {
      // test case for each type
    });

  });

});
