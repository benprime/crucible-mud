import mocks from '../../../../spec/mocks';
import sut from './unequipAction';

jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');

describe('unequip', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    test('should output message when item is not equipped', () => {

      sut.execute(socket.character, null);
      
      expect(socket.character.output).toHaveBeenCalledWith('You don\'t have that item equipped.');
    });

    // good candidate for that test case custom runner
    xtest('should unequip item put it into backpack', () => {
      // test case for each type
    });

  });

});
