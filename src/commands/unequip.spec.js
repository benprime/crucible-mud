import { mockAutocompleteMultiple } from '../core/autocomplete';
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

    // good candidate for that test case custom runner
    xtest('should unequip item put it into backpack', () => {
      // test case for each type
    });

  });

});
