import { mockGetRoomById } from '../models/room';
import { mockAutocompleteMultiple } from '../core/autocomplete';
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

  // describe('dispatch', () => {
  //   beforeEach(() => {
  //     jest.spyOn(sut, 'execute');
  //     socket.emit.mockClear();
  //   });

  //   test('should call execute with match', () => {
  //     sut.dispatch(socket, ['take', 'aItem']);

  //     expect(sut.execute).toBeCalledWith(socket, 'aItem');
  //   });

  //   test('should output message if multiple matches', () => {
  //     sut.dispatch(socket, 'take', 'aItem', 'anotherItem');

  //     expect(socket.character.output).toHaveBeenCalledWith('What do you want to take?' )
  //   });
  // });

  describe('execute', () => {

    beforeEach(() => {
      socket.emit.mockReset();
      socket.character.save.mockReset();
      mockAutocompleteMultiple.mockReset();
    });

    test('should output message when item is not found', () => {
      mockRoom.save.mockClear();
      mockAutocompleteMultiple.mockReturnValueOnce(null);
      expect.assertions(3);

      return sut.execute(socket.character, 'itemNotThere').catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('You don\'t see that here!');
        expect(mockRoom.save).not.toHaveBeenCalled();
        expect(socket.character.save).not.toHaveBeenCalled();
      });

    });

    test('should output message when item is fixed', () => {
      mockRoom.save.mockClear();
      socket.character.inventory.length = 0;

      const fixedItem = {
        id: 'aItemId',
        name: 'aItem',
        fixed: true,
      };
      mockAutocompleteMultiple.mockReturnValueOnce({ item: fixedItem });
      expect.assertions(4);

      return sut.execute(socket.character, 'aItem').catch(() => {
        expect(socket.character.inventory).toHaveLength(0);
        expect(socket.character.output).toHaveBeenCalledWith('You cannot take that!');
        expect(mockRoom.save).not.toHaveBeenCalled();
        expect(socket.character.save).not.toHaveBeenCalled();
      });


    });

    test('should update the room/user and save room/user to database', () => {
      const item = {
        id: 'aItemId',
        name: 'aItem',
      };
      mockRoom.inventory = [item];
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      expect.assertions(5);

      return sut.execute(socket.character, 'aItem').then(() => {
        expect(mockRoom.inventory).not.toContain(item);
        // THIS IS RAD
        expect(socket.character.inventory).toContainEqual(expect.objectContaining({ name: 'aItem' }));
        expect(socket.character.save).toHaveBeenCalled();
        expect(socket.character.output).toHaveBeenCalledWith(`${item.name} taken.`);
        expect(socket.character.toRoom).toHaveBeenCalledWith(`${socket.character.name} takes ${item.name}.`, [socket.character.id]);
      });

    });
  });

  describe('help', () => {
    test('outputs message', () => {
      sut.help(socket.character);

      expect(socket.character.output).toHaveBeenCalledWith('<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />');
    });
  });
});
