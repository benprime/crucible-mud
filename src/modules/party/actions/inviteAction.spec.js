import { mockAutocompleteCharacter } from '../../../core/autocomplete';
import mocks from '../../../../spec/mocks';
import sut from './inviteAction';

jest.mock('../../../models/room');
jest.mock('../../../core/socketUtil');
jest.mock('../../../core/autocomplete');

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
      mockTargetSocket.character.roomId = socket.character.roomId;

      global.io.addCharacterToIORoom(mockRoom.id, mockTargetSocket);

      socket.character.inventory = [{ id: 'aItemId', name: 'aItem' }];
      socket.character.name = 'TestUser';
      socket.character.partyInvites = [];
      socket.emit.mockClear();
    });

    test('users following a party leader may not invite followers', () => {
      socket.character.leader = 'aLeader';


      sut.execute(socket.character, mockTargetSocket.character);

      expect(socket.character.output).toHaveBeenCalledWith('Only the party leader may invite followers.');
      expect(mockTargetSocket.character.partyInvites).toHaveLength(0);
    });

    test('adds invite to socket tracking variable of recipient socket', () => {
      socket.character.leader = undefined;
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);

      sut.execute(socket.character, mockTargetSocket.character);

      expect(socket.character.output).toHaveBeenCalledWith('You have invited TargetUser to join your party.');
      expect(mockTargetSocket.character.output).toHaveBeenCalledWith('TestUser has invited you to join a party. Type \'follow TestUser\' to accept.');
      expect(mockTargetSocket.character.partyInvites).toContain(socket.character.id);
    });

  });
});
