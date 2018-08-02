import Room, { mockGetById, mockValidDirectionInput, mockShortToLong, mockLongToShort } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './follow';

jest.mock('../models/room');


import { mockSocketInRoom, mockRoomMessage, mockGetSocketByUsername, mockGetSocketByUserId, mockGetFollowingSockets, mockGetRoomSockets, mockValidUserInRoom } from '../core/socketUtil';
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

      expect(socket.partyInvites.length).toBe(0);
    });

    // this feature is not yet implemented
    xtest('transfers any current followers to the new leader\'s party', () => {
      fail('not completed');
    });

  });
});
