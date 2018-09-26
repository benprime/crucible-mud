import { mockGetRoomById } from '../models/room';
import { mockAutocompleteMultiple, mockAutocompleteMob } from '../core/autocomplete';
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
      const mockMob = {
        id: 123,
        name: 'a thing!',
      };
      mockGetRoomById.mockReturnValueOnce(mockRoom);
      mockAutocompleteMob.mockReturnValueOnce(mockMob);

      expect.assertions(3);

      return sut.execute(socket.character, 'thing').then(() => {
        expect(socket.character.output).toHaveBeenCalledWith('<span class="olive">*** Combat Engaged ***</span>');
        expect(socket.character.toRoom).toHaveBeenCalledWith(`${socket.character.name} moves to attack ${mockMob.displayName}!`, [socket.character.id]);
        expect(socket.character.attackTarget).toBe(mockMob.id);
      });
    });

    test('should set state and emit output when no target found', () => {
      mockGetRoomById.mockReturnValueOnce(mockRoom);
      mockAutocompleteMultiple.mockReturnValueOnce(null);

      sut.execute(socket.character, 'thing');

      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.character.attackTarget).toBeFalsy();
    });
  });
});
