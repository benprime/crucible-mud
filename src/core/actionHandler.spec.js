import { mockGetRoomById } from '../models/room';
import { mockGetSocketByCharacterId } from '../core/socketUtil';
import { mockAutocompleteTypes, mockAutocompleteCharacter } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import { when } from 'jest-when';
import sut from './actionHandler';


jest.mock('../models/room');
jest.mock('../core/socketUtil');
jest.mock('../core/autocomplete');

global.io = new mocks.IOMock();
let mockRoom;
let targetSocket;
let bystanderSocket;
let charactersInRoom = [];

describe('actionHandler', () => {
  let socket;
  let sockets = {};

  describe('actionDispatcher', () => {
    beforeEach(() => {
      sockets = {};
      mockRoom = mocks.getMockRoom();
      mockGetRoomById.mockReturnValue(mockRoom);

      socket = new mocks.SocketMock();
      when(mockGetSocketByCharacterId).calledWith(socket.character.name).mockReturnValue(socket);
      sockets[socket.id] = socket;
      socket.character.roomId = mockRoom.id;

      charactersInRoom.push('aDifferentUser');
      targetSocket = new mocks.SocketMock();
      targetSocket.character.name = 'aDifferentUser';
      targetSocket.character.roomId = mockRoom.id;
      when(mockGetSocketByCharacterId).calledWith(targetSocket.character.name).mockReturnValue(targetSocket);
      sockets[targetSocket.id] = targetSocket;

      charactersInRoom.push('aThirdUser');
      bystanderSocket = new mocks.SocketMock();
      bystanderSocket.character.name = 'aThirdUser';
      bystanderSocket.character.roomId = mockRoom.id;
      when(mockGetSocketByCharacterId).calledWith(bystanderSocket.character.name).mockReturnValue(bystanderSocket);
      sockets[bystanderSocket.id] = bystanderSocket;

      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms[mockRoom.id] = {
        sockets,
      };
    });

    test('should output message when no socket is returned for the user', () => {
      // arrange
      mockAutocompleteCharacter.mockReturnValueOnce(targetSocket);
      //targetSocket = undefined;

      // act
      return sut.actionDispatcher(socket.character, 'hug', 'anUnknownUser').catch(response => {
        // assert
        expect(response).toBe('You don\'t see anUnknownUser anywhere!');
      });

    });

    test('should output message when action is performed on self', () => {
      // arrange
      //targetSocket = socket;

      // act
      return sut.actionDispatcher(socket.character, 'hug').then(response => {
        // assert
        expect(response.charMessages).toHaveLength(3);
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'You hug yourself.' });
        expect(response.charMessages).toContainEqual({ charId: bystanderSocket.character.id, message: `${socket.character.name} hugs himself.` });
      });
    });

    test('should output message when action is performed on other user', () => {
      // arrange
      mockAutocompleteCharacter.mockReturnValueOnce(targetSocket.character);
      mockRoom.userInRoom.mockReturnValue(true);
      mockAutocompleteTypes.mockReturnValueOnce({ item: targetSocket.user });

      // act
      return sut.actionDispatcher(socket.character, 'hug', targetSocket.character.name).then(response => {
        // assert
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: `You hug ${targetSocket.character.name} close!` });
        expect(response.charMessages).toContainEqual({ charId: targetSocket.character.id, message: `${socket.character.name} hugs you close!` });
        expect(response.charMessages).toContainEqual({ charId: bystanderSocket.character.id, message: `${socket.character.name} hugs ${targetSocket.character.name} close!` });
        //expect(global.io.to(bystanderSocket.id).emit).toBeCalledWith('output', { message: `${socket.character.name} hugs ${targetSocket.character.name} close!` });
        //expect(targetSocket.emit).toBeCalledWith('output', { message: `${socket.character.name} hugs you close!` });

      });

    });

    test('should return false when action is not found', () => {
      return sut.actionDispatcher(socket.character, 'notAnAction', targetSocket.character.name).catch(response => {
        expect(response).toBe('invalid action');
      });
    });
  });
});