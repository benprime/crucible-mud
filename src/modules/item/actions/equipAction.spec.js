
import { mockAutocompleteMultiple } from '../../../core/autocomplete';

import Item from '../../../models/item';
import mocks from '../../../../spec/mocks';
import sut from './equipAction';

jest.mock('../../../core/autocomplete');
global.io = new mocks.IOMock();

describe('equip', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    test('should do nothing when item is not in inventory', () => {
      mockAutocompleteMultiple.mockReturnValueOnce(null);
      expect.assertions(1);

      return sut.execute(socket.character, null).catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('You don\'t seem to be carrying that!\n');
      });

    });

    test('should output message when item is not equipable', () => {
      const sword = new Item();
      sword.equip = null;
      sword.name = 'sword';
      mockAutocompleteMultiple.mockReturnValueOnce({ item: sword });
      expect.assertions(1);

      return sut.execute(socket.character, 'sword').catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('You cannot equip that!\n');
      });
    });

    // good candidate for that test case custom runner
    test('should equip item of equip type and remove from backpack', () => {
      // test case for each type
    });

  });

});
