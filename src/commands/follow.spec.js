import mocks from '../../spec/mocks';
import sut from './follow';
import { mockValidUserInRoom } from '../core/socketUtil';

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

      socket.partyInvites = [mockInvitingSocket.user.id];
    });

    test('sets socket leader tracking variable and clears follow invite when user follows user', () => {
      sut.execute(socket, mockInvitingSocket.user.username);

      expect(socket.partyInvites).toHaveLength(0);
    });

    // this feature is not yet implemented
    xtest('transfers any current followers to the new leader\'s party', () => {
      fail('not completed');
    });

  });
});
