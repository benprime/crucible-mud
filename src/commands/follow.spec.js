import mocks from '../../spec/mocks';
import sut from './follow';
import { mockValidUserInRoom, mockGetFollowingSockets } from '../core/socketUtil';

jest.mock('../models/room');
jest.mock('../core/socketUtil');


describe('follow', () => {
  let socket;
  let mockInvitingSocket;

  beforeAll(() => {
    mockInvitingSocket = new mocks.SocketMock();
    mockInvitingSocket.user.username = 'InvitingUser';
    socket = new mocks.SocketMock();
    mockValidUserInRoom.mockReturnValue(mockInvitingSocket);
  });

  describe('execute', () => {

    beforeEach(() => {

      socket.emit.mockClear();

      socket.partyInvites = [mockInvitingSocket.character.id];
    });

    test('sets socket leader tracking variable and clears follow invite when user follows user', () => {
      mockGetFollowingSockets.mockReturnValueOnce([]);
      sut.execute(socket, mockInvitingSocket.user.username);

      expect(socket.partyInvites).toHaveLength(0);
    });

    test('transfers any current followers to the new leader\'s party', () => {
      const follower1 = new mocks.SocketMock();
      const follower2 = new mocks.SocketMock();
      const follower3 = new mocks.SocketMock();
      mockGetFollowingSockets.mockReturnValueOnce([follower1, follower2, follower3]);
      
      sut.execute(socket, mockInvitingSocket.user.username);

      expect(follower1.leader).toBe(mockInvitingSocket.character.id);
      expect(follower2.leader).toBe(mockInvitingSocket.character.id);
      expect(follower3.leader).toBe(mockInvitingSocket.character.id);
    });

  });
});
