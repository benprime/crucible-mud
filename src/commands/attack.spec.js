import { mockGetRoomById } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './attack';

jest.mock('../models/room');
jest.mock('../core/autocomplete');

describe('attack', () => {
  let socket;
  let mockRoom;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    mockRoom = mocks.getMockRoom();
  });

  beforeEach(() => {
    socket.reset();
  });

  describe('execute', () => {
    beforeEach(() => {
      socket = new mocks.SocketMock();
      socket.user.username = 'aName';
      socket.character.roomId = mockRoom.id;
    });

    test('should set state and emit output when valid target found', () => {
      const autocompleteResult = {
        item: {
          id: 123,
          displayName: 'a thing!',
        },
        type: 'mob',
      };
      mockGetRoomById.mockReturnValueOnce(mockRoom);
      mockAutocompleteTypes.mockReturnValueOnce(autocompleteResult);

      sut.execute(socket, 'thing');

      expect(socket.emit).toBeCalledWith('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      expect(socket.broadcast.to(socket.character.roomId).emit).toBeCalledWith('output', { message: `${socket.user.username} moves to attack ${autocompleteResult.item.displayName}!` });
      expect(socket.character.attackTarget).toBe(autocompleteResult.item.id);
    });

    test('should set state and emit output when no target found', () => {
      mockGetRoomById.mockReturnValueOnce(mockRoom);
      mockAutocompleteTypes.mockReturnValueOnce(null);

      sut.execute(socket, 'thing');

      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.character.attackTarget).toBeFalsy();
    });
  });
});
