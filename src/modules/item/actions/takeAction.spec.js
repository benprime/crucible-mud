import { mockGetRoomById } from '../../../models/room';
import Item from '../../../models/item';
import { mockAutocompleteMultiple } from '../../../core/autocomplete';
import mocks from '../../../../spec/mocks';
import sut from './takeAction';

jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');
jest.mock('../../../core/socketUtil');

global.io = new mocks.IOMock();
let socket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
mockGetRoomById.mockReturnValue(mockRoom);


describe('take', () => {

  describe('execute', () => {

    beforeEach(() => {
      socket.emit.mockReset();
      socket.character.save.mockReset();
      mockAutocompleteMultiple.mockReset();
    });

    test('should output message when item is not found', () => {
      // arrange
      mockRoom.save.mockClear();
      mockAutocompleteMultiple.mockReturnValueOnce(null);

      // act
      const result = sut.execute(socket.character, null);
      
      // assert
      expect(result).toBe(false);
      expect(socket.character.output).toHaveBeenCalledWith('You don\'t see that here!');
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(socket.character.save).not.toHaveBeenCalled();

    });

    test('should output message when item is fixed', () => {
      // arrange
      mockRoom.save.mockClear();
      socket.character.inventory.length = 0;

      const fixedItem = {
        id: 'aItemId',
        name: 'aItem',
        fixed: true,
      };

      // act
      const result = sut.execute(socket.character, fixedItem);

      // assert
      expect(result).toBe(false);
      expect(socket.character.inventory).toHaveLength(0);
      expect(socket.character.output).toHaveBeenCalledWith('You cannot take that!');
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(socket.character.save).not.toHaveBeenCalled();
    });

    test('should update the room/user and save room/user to database', () => {
      // arrange
      const item = new Item({
        id: 'aItemId',
        name: 'aItem',
      });
      mockRoom.inventory = [item];

      // act
      const result = sut.execute(socket.character, item);

      // assert
      expect(socket.character.output).toHaveBeenCalledWith(`${item.name} taken.`);
      expect(result).toBe(true);
      expect(mockRoom.inventory).not.toContain(item);
      // THIS IS RAD
      expect(socket.character.inventory).toContainEqual(expect.objectContaining({ name: 'aItem' }));
      expect(socket.character.save).toHaveBeenCalled();
      expect(socket.character.toRoom).toHaveBeenCalledWith(`${socket.character.name} takes ${item.name}.`, [socket.character.id]);
    });
  });

});
