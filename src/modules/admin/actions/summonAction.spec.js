import { mockGetRoomById } from '../../../models/room';
import { mockGetSocketByCharacterId, mockRoomMessage } from '../../../core/socketUtil';
import { mockAutocompleteCharacter } from '../../../core/autocomplete';
import mocks from '../../../../spec/mocks';
import sut from './summonAction';

jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');
jest.mock('../../../core/socketUtil');

global.io = new mocks.IOMock();
let mockTargetSocket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
mockGetRoomById.mockReturnValue(mockRoom);

describe('summon', () => {
  let socket;
  let otherRoom;

  beforeEach(() => {
    mockRoom.name = 'OLD';
    otherRoom = mocks.getMockRoom();
    otherRoom.name = 'NEW';

    // acting admin socket
    socket = new mocks.SocketMock();
    socket.character.name = 'TestUser';

    // target user socket
    mockTargetSocket = new mocks.SocketMock();
    mockTargetSocket.character.name = 'OtherUser';

  });

  describe('execute', () => {
    test('should output message when user is not found', () => {
      const result = sut.execute(socket.character, 'Wrong');
      expect(result).toBe(false);
      expect(socket.character.output).toHaveBeenCalledWith('Player not found.');
    });

    test('should join target user to admin room and leave current room', () => {
      // arrange
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockGetSocketByCharacterId.mockReturnValueOnce(mockTargetSocket);
      mockTargetSocket.character.roomId = otherRoom.id;

      // act
      const result = sut.execute(socket.character, 'OtherUser');

      // assert
      expect(result).toBe(true);
      expect(mockTargetSocket.character.teleport).toHaveBeenCalledWith(socket.character.roomId);
    });


    test('should output messages when command successful', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      const oldRoomId = mockTargetSocket.character.roomId = 'oldRoomId';

      // act
      const result = sut.execute(socket.character, 'OtherUser');
      
      // assert
      expect(result).toBe(true);
      expect(mockTargetSocket.character.output).toHaveBeenCalledWith('You were summoned to TestUser\'s room!');
      expect(mockRoomMessage).toHaveBeenCalledWith(oldRoomId, 'OtherUser vanishes!');
      expect(socket.character.toRoom).toHaveBeenCalledWith('OtherUser appears out of thin air!', [mockTargetSocket.character.id]);

    });

  });
});
