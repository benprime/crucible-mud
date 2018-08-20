import { mockCharacterInRoom } from '../core/socketUtil';
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

      global.io.addCharacterToIORoom(mockRoom.id, mockTargetSocket);

      socket.character.inventory = [{ id: 'aItemId', name: 'aItem' }];
      socket.user.username = 'TestUser';
      socket.character.partyInvites = [];
      socket.emit.mockClear();
    });

    test('users following a party leader may not invite followers', () => {
      socket.leader = 'aLeader';
      let username = 'TargetUser';
      mockCharacterInRoom.mockReturnValueOnce(mockTargetSocket);

      sut.execute(socket, username);

      expect(mockTargetSocket.character.partyInvites).not.toContain(socket.character.id);
    });

    test('adds invite to socket tracking variable of recipient socket', () => {
      socket.leader = undefined;
      let username = 'TargetUser';
      mockCharacterInRoom.mockReturnValueOnce(mockTargetSocket);

      sut.execute(socket, username);

      expect(mockTargetSocket.character.partyInvites).toContain(socket.character.id);
    });

  });
});
