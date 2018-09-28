import { mockGetRoomById } from '../../../models/room';
import { mockAutocompleteMultiple } from '../../../core/autocomplete';
import directions from '../../../core/directions';
import mocks from '../../../../spec/mocks';
import sut from './hideAction';


jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');

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
      expect.assertions(2);

      return sut.execute(socket.character, directions.E).catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('No exit in that direction.<br />');
        expect(mockRoom.save).not.toHaveBeenCalled();
      });
    });

  });

  test('should succeed on valid direction', () => {
    expect.assertions(3);

    return sut.execute(socket.character, directions.D).then(() => {
      const exit = mockRoom.exits.find(({ dir }) => dir === 'd');
      expect(socket.character.output).toHaveBeenCalledWith('The exit has been concealed.<br />');
      expect(mockRoom.save).toHaveBeenCalledTimes(1);
      expect(exit.hidden).toBe(true);
    });
  });

  describe('items', () => {

    test('should output message when item is invalid', () => {
      expect.assertions(2);
      return sut.execute(socket.character, 'emu').catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('Item does not exist in inventory or in room.<br />');
        expect(mockRoom.save).not.toHaveBeenCalled();
      });
    });

    test('should succeed on valid item', () => {
      const item = { id: 'clownId', name: 'clown', hidden: false };
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      expect.assertions(3);

      return sut.execute(socket.character, 'clown').then(() => {
        expect(socket.character.output).toHaveBeenCalledWith('clown has been concealed.<br />');
        expect(mockRoom.save).toHaveBeenCalledTimes(1);
        expect(item.hidden).toBe(true);
      });

    });
  });
});
