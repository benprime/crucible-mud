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

      return sut.execute(socket.character, 'thing').then(response => {
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: '<span class="olive">*** Combat Engaged ***</span>' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.id, message: `${socket.character.name} moves to attack ${autocompleteResult.item.displayName}!` });
        expect(socket.character.attackTarget).toBe(autocompleteResult.item.id);
      });
    });

    test('should set state and emit output when no target found', () => {
      mockGetRoomById.mockReturnValueOnce(mockRoom);
      mockAutocompleteTypes.mockReturnValueOnce(null);

      sut.execute(socket.character, 'thing');

      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.character.attackTarget).toBeFalsy();
    });
  });
});
