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
      mockTargetSocket.character.name = 'TargetUser';

      global.io.addCharacterToIORoom(mockRoom.id, mockTargetSocket);

      socket.character.inventory = [{ id: 'aItemId', name: 'aItem' }];
      socket.character.name = 'TestUser';
      socket.character.partyInvites = [];
      socket.emit.mockClear();
    });

    test('users following a party leader may not invite followers', () => {
      socket.character.leader = 'aLeader';
      let username = 'TargetUser';
      mockCharacterInRoom.mockReturnValueOnce(mockTargetSocket.character);

      return sut.execute(socket.character, username).catch(response => {
        expect(response).toEqual('Only the party leader may invite followers.');
        expect(mockTargetSocket.character.partyInvites).toHaveLength(0);
      });

    });

    test('adds invite to socket tracking variable of recipient socket', () => {
      socket.character.leader = undefined;
      let username = 'TargetUser';
      mockCharacterInRoom.mockReturnValueOnce(mockTargetSocket.character);

      return sut.execute(socket.character, username).then(commandResult => {
        expect(commandResult.charMessages).toHaveLength(2);
        expect(mockTargetSocket.character.partyInvites).toContain(socket.character.id);
      });

    });

  });
});
