import { mockGetRoomById } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './take';

jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

global.io = new mocks.IOMock();
let socket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
mockGetRoomById.mockReturnValue(mockRoom);


describe('take', () => {

  describe('dispatch', () => {
    beforeEach(() => {
      jest.spyOn(sut, 'execute');
      socket.emit.mockClear();
    });

    test('should call execute with match', () => {
      sut.dispatch(socket, ['take', 'aItem']);

      expect(sut.execute).toBeCalledWith(socket, 'aItem');
    });

    test('should output message if multiple matches', () => {
      sut.dispatch(socket, 'take', 'aItem', 'anotherItem');

      expect(socket.emit).toBeCalledWith('output', { message: 'What do you want to take?' });
    });
  });

  describe('execute', () => {

    beforeEach(() => {
      socket.emit.mockReset();
      socket.character.save.mockReset();
      mockAutocompleteTypes.mockReset();
    });
    
    test('should output message when item is not found', () => {
      mockRoom.save.mockClear();
      mockAutocompleteTypes.mockReturnValueOnce(null);

      sut.execute(socket, 'itemNotThere');

      expect(socket.emit).toBeCalledWith('output', { message: 'You don\'t see that here!' });
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(socket.character.save).not.toHaveBeenCalled();
    });

    test('should output message when item is fixed', () => {
      mockRoom.save.mockClear();
      socket.character.inventory.length = 0;

      const fixedItem = {
        id: 'aItemId',
        name: 'aItem',
        displayName: 'aItem display name',
        fixed: true,
      };
      mockAutocompleteTypes.mockReturnValueOnce({item: fixedItem});


      sut.execute(socket, 'aItem');

      expect(socket.character.inventory).toHaveLength(0);
      expect(socket.emit).toBeCalledWith('output', { message: 'You cannot take that!' });
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(socket.character.save).not.toHaveBeenCalled();
    });

    test('should update the room/user and save room/user to database', () => {
      const item = {
        id: 'aItemId',
        name: 'aItem',
        displayName: 'aItem display name',
      };
      mockRoom.inventory = [item];
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });

      sut.execute(socket, 'aItem');

      expect(mockRoom.inventory).not.toContain(item);
      // THIS IS RAD
      expect(socket.character.inventory).toContainEqual(expect.objectContaining({ name: 'aItem' }));

      expect(socket.emit).toBeCalledWith('output', { message: `${item.displayName} was added to your inventory.` });
      expect(socket.character.save).toHaveBeenCalled();
      expect(socket.emit).toBeCalledWith('output', { message: `${item.displayName} taken.` });
      expect(socket.broadcast.to(socket.character.roomId).emit).toBeCalledWith('output', { message: `${socket.user.username} takes ${item.displayName}.` });
    });
  });

  describe('help', () => {
    test('outputs message', () => {
      sut.help(socket);

      expect(socket.emit).toBeCalledWith('output', { message: '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />' });
    });
  });
});
