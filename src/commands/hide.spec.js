import { mockGetRoomById, mockValidDirectionInput } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './hide';


jest.mock('../models/room');
jest.mock('../core/autocomplete');

let mockRoom;


describe('hide', () => {
  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true },
        { dir: 's', roomId: 'nRoomId' },
        { dir: 'u', roomId: 'nRoomId', hidden: true },
        { dir: 'd', roomId: 'nRoomId', hidden: false },
      ],
      getExit: jasmine.createSpy('getExit').and.callFake(dir => mockRoom.exits.find(e => e.dir == dir)),
      save: jasmine.createSpy('roomSave'),
    };
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  describe('doors', () => {
    test('should output message when direction is invalid', () => {
      mockValidDirectionInput.mockReturnValueOnce('e');
      
      sut.execute(socket, 'e');

      expect(socket.emit).toBeCalledWith('output', { message: 'No exit in that direction.<br />' });
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

    test('should succeed on valid direction', () => {
      mockValidDirectionInput.mockReturnValueOnce('d');
      
      sut.execute(socket, 'd');
      const exit = mockRoom.exits.find(({ dir }) => dir === 'd');

      expect(socket.emit).toBeCalledWith('output', { message: 'The exit has been concealed.<br />' });
      expect(mockRoom.save).toHaveBeenCalledTimes(1);
      expect(exit.hidden).toBe(true);
    });
  });

  describe('items', () => {

    test('should output message when item is invalid', () => {
      mockAutocompleteTypes.mockReturnValueOnce(null);
      sut.execute(socket, 'emu');

      expect(socket.emit).toBeCalledWith('output', { message: 'Item does not exist in inventory or in room.<br />' });
      expect(mockRoom.save).not.toHaveBeenCalled();
    });



    test('should succeed on valid item', () => {
      const item = { id: 'clownId', name: 'clown', hidden: false };
      mockAutocompleteTypes.mockReturnValueOnce({item: item});

      sut.execute(socket, 'clown');

      expect(socket.emit).toBeCalledWith('output', { message: 'clown has been concealed.<br />' });
      expect(mockRoom.save).toHaveBeenCalledTimes(1);
      expect(item.hidden).toBe(true);
    });
  });
});
