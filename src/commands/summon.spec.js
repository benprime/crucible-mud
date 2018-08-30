import { mockGetRoomById } from '../models/room';
import { mockGetSocketByCharacterId } from '../core/socketUtil';
import { mockAutocompleteCharacter } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './summon';

jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

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
      return sut.execute(socket.character, 'Wrong').catch(response => {
        expect(response).toEqual('Player not found.');
      });

    });

    test('should join target user to admin room and leave current room', () => {
      // arrange
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockGetSocketByCharacterId.mockReturnValueOnce(mockTargetSocket);
      mockTargetSocket.character.roomId = otherRoom.id;

      // act
      return sut.execute(socket.character, 'OtherUser').then(() => {
        // assert
        expect(mockTargetSocket.character.teleport).toHaveBeenCalledWith(socket.character.roomId);
      });

    });

    test('should output messages when command successful', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      const oldRoomId = mockTargetSocket.character.roomId = 'oldRoomId';

      // act
      return sut.execute(socket.character, 'OtherUser').then(response => {
        // assert
        expect(response.charMessages).toContainEqual({ charId: mockTargetSocket.character.id, message: 'You were summoned to TestUser\'s room!' });
        expect(response.roomMessages).toContainEqual({ roomId: oldRoomId, message: 'OtherUser vanishes!' });
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'OtherUser appears out of thin air!', exclude: [mockTargetSocket.character.id] });
      });

    });

    test('should be an admin command', () => {
      expect(sut.admin).toBe(true);
    });
  });
});
