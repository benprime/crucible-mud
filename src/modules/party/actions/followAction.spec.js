import mocks from '../../../../spec/mocks';
import sut from './followAction';
import { mockGetFollowers } from '../../../core/socketUtil';
import { mockAutocompleteCharacter } from '../../../core/autocomplete';

jest.mock('../../../models/room');
jest.mock('../../../core/socketUtil');
jest.mock('../../../core/autocomplete');

describe('follow', () => {
  let socket;
  let mockInvitingSocket;

  beforeAll(() => {
    mockInvitingSocket = new mocks.SocketMock();
    mockInvitingSocket.character.name = 'InvitingUser';
    socket = new mocks.SocketMock();
    socket.character.roomId = mockInvitingSocket.character.roomId;
  });

  describe('execute', () => {

    beforeEach(() => {
      socket.emit.mockClear();
      socket.character.partyInvites = [mockInvitingSocket.character.id];
    });

    test('sets socket leader tracking variable and clears follow invite when user follows user', () => {
      mockGetFollowers.mockReturnValueOnce([]);
      mockAutocompleteCharacter.mockReturnValueOnce(mockInvitingSocket.character);

      sut.execute(socket.character, mockInvitingSocket.character);

      expect(socket.character.partyInvites).toHaveLength(0);
    });

    test('transfers any current followers to the new leader\'s party', () => {
      const follower1 = mocks.getMockCharacter();
      const follower2 = mocks.getMockCharacter();
      const follower3 = mocks.getMockCharacter();
      mockGetFollowers.mockReturnValueOnce([follower1, follower2, follower3]);
      mockAutocompleteCharacter.mockReturnValueOnce(mockInvitingSocket.character);

      sut.execute(socket.character, mockInvitingSocket.character);

      expect(follower1.leader).toBe(mockInvitingSocket.character.id);
      expect(follower2.leader).toBe(mockInvitingSocket.character.id);
      expect(follower3.leader).toBe(mockInvitingSocket.character.id);
    });

  });
});
