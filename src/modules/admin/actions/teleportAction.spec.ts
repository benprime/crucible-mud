import { mockGetRoomById, mockRoomCache } from '../../../models/room';
import { mockGetSocketByCharacterId } from '../../../core/socketUtil';
import { mockAutocompleteCharacter } from '../../../core/autocomplete';
import { when } from 'jest-when';
import mocks from '../../../../spec/mocks';
import sut from './teleportAction';

jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');
jest.mock('../../../core/socketUtil');

describe('teleport', () => {
  let socket;
  let otherSocket;
  let currentRoom;
  let otherRoom;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.character.name = 'TestUser';

    otherSocket = new mocks.SocketMock();
    otherSocket.character.name = 'OtherUser';

    currentRoom = mocks.getMockRoom(socket.character.roomId);
    currentRoom.name = 'OLD';

    otherRoom = mocks.getMockRoom(otherSocket.character.roomId);
    otherRoom.name = 'NEW';

    mockRoomCache[currentRoom.id] = currentRoom;
    mockRoomCache[otherRoom.id] = otherRoom;

    when(mockGetRoomById).calledWith(currentRoom.id).mockReturnValue(currentRoom);
    when(mockGetRoomById).calledWith(otherRoom.id).mockReturnValue(otherRoom);

    global.io = new mocks.IOMock();
    global.io.sockets.connected[socket.id] = socket;
    global.io.sockets.connected[otherSocket.id] = otherSocket;
  });

  beforeEach(() => {
    mockGetSocketByCharacterId.mockReset();
  });

  describe('execute', () => {

    test('should teleport to another user\'s room if parameter is a username', () => {
      // arrange
      mockAutocompleteCharacter.mockReturnValueOnce(otherSocket.character);

      // act
      const result = sut.execute(socket.character, otherSocket.character.name);
      
      // assert
      expect(result).toBe(true);
      expect(socket.character.teleport).toHaveBeenCalled();
    });

    test('should teleport to room if parameter is a room', () => {
      // act
      const result = sut.execute(socket.character, otherRoom.id);

      // assert
      expect(result).toBe(true);
      expect(socket.character.teleport).toHaveBeenCalled();
    });

    test('should output messages when target is invalid user', () => {
      // arrange
      mockAutocompleteCharacter.mockReturnValueOnce(null);

      // act
      const result = sut.execute(socket.character, 'Bobby');
      
      // assert
      expect(result).toBe(false);
      expect(socket.character.output).toHaveBeenCalledWith('Target not found.');

    });

  });
});
