import { mockValidUserInRoom } from '../core/socketUtil';
import mocks from '../../spec/mocks';
import sut from './invite';


jest.mock('../models/room');
jest.mock('../core/socketUtil');

global.io = new mocks.IOMock();
let mockTargetSocket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();

describe('invite', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();

    // add mock room to io rooms
    global.io.sockets.adapter.rooms[mockRoom.id] = mockRoom;
  });

  describe('execute', () => {

    beforeEach(() => {
      mockTargetSocket.user.username = 'TargetUser';

      global.io.addUserToIORoom(mockRoom.id, mockTargetSocket);

      socket.user.inventory = [{ id: 'aItemId', name: 'aItem' }];
      socket.user.username = 'TestUser';
      socket.partyInvites = [];
      socket.emit.mockClear();
    });

    test('users following a party leader may not invite followers', () => {
      socket.leader = 'aLeader';
      let username = 'TargetUser';
      mockValidUserInRoom.mockReturnValueOnce(mockTargetSocket);

      sut.execute(socket, username);

      expect(mockTargetSocket.partyInvites).not.toContain(socket.user.id);
    });

    test('adds invite to socket tracking variable of recipient socket', () => {
      socket.leader = undefined;
      let username = 'TargetUser';
      mockValidUserInRoom.mockReturnValueOnce(mockTargetSocket);

      sut.execute(socket, username);

      expect(mockTargetSocket.partyInvites).toContain(socket.user.id);
    });

  });
});
