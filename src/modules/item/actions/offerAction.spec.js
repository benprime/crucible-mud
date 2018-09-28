import { mockGetRoomById } from '../../../models/room';
import Item from '../../../models/item';
import { mockGetSocketByCharacterId } from '../../../core/socketUtil';
import { mockAutocompleteMultiple, mockAutocompleteCharacter } from '../../../core/autocomplete';
import mocks from '../../../../spec/mocks';
import sut from './offerAction';

jest.mock('../../../config');
jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');
jest.mock('../../../core/socketUtil');

let mockTargetSocket;
let getCharacterNamesResult = [];
let mockRoom = mocks.getMockRoom();
mockRoom.getCharacterNames = jest.fn(() => getCharacterNamesResult).mockName('getCharacterNamesSpy');
mockGetRoomById.mockReturnValue(mockRoom);
global.io = new mocks.IOMock();

describe('offer', () => {
  let socket;
  let item = new Item({ name: 'aItem' });

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    getCharacterNamesResult = ['TestUser', 'aUser'];

    beforeEach(() => {
      mockTargetSocket = new mocks.SocketMock();
      mockTargetSocket.character.roomId = socket.character.roomId;
      socket.character.inventory = [item];
      socket.character.name = 'TestUser';
      socket.emit.mockClear();
    });

    test('should return when item is not in inventory', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce(null);
      expect.assertions(1);

      sut.execute(socket.character, 'aItem', 'aUser');

      expect(socket.character.output).toHaveBeenCalledWith('Unknown user or user not connected.');
    });

    test('should output message when user is not in room', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      mockTargetSocket.character.roomId = 'a different room';

      sut.execute(socket.character, 'aItem', 'aUser');

      expect(socket.character.output).toHaveBeenCalledWith('Unknown user or user not connected.');
    });

    test('should output message if user socket is not found', () => {
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item }).mockReturnValueOnce(undefined);

      sut.execute(socket.character, 'aItem', 'aUser');

      expect(socket.character.output).toHaveBeenCalledWith('Unknown user or user not connected.');
    });

    test('should add offer to other user socket offers collection if offers collection is empty', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      socket.character.inventory = [item];
      mockTargetSocket.character.offers = [];

      let expectedOffer = {
        fromUserName: socket.character.name,
        toUserName: 'aUser',
        item: item,
      };

      sut.execute(socket.character, 'aItem', 'aUser').then(() => {
        expect(mockTargetSocket.character.offers[0]).toHaveProperty('fromUserName', expectedOffer.fromUserName);
        expect(mockTargetSocket.character.offers[0]).toHaveProperty('toUserName', expectedOffer.toUserName);
        expect(mockTargetSocket.character.offers[0].item.id).toBe(expectedOffer.item.id);
        expect(mockTargetSocket.character.output).toHaveBeenCalledWith('TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser');
        expect(socket.character.output).toHaveBeenCalledWith('You offer your aItem to aUser.');
      });

    });

    test('should replace offer to other user if offering user makes a second offer while first offer still pending', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });

      socket.user = {
        username: 'TestUser',
        inventory: [item],
      };

      let existingItem = new Item({ name: 'differentItem' });
      let existingOffer = {
        fromUserName: socket.character.name,
        toUserName: mockTargetSocket.character.name,
        item: existingItem,
      };

      mockTargetSocket.character.offers = [existingOffer];

      sut.execute(socket.character, item, 0, mockTargetSocket.character);

      expect(mockTargetSocket.character.offers).toHaveLength(1);
      expect(mockTargetSocket.character.offers[0]).toHaveProperty('fromUserName', existingOffer.fromUserName);
      expect(mockTargetSocket.character.offers[0]).toHaveProperty('toUserName', existingOffer.toUserName);
      expect(mockTargetSocket.character.offers[0].item.id).toBe(item.id);
      expect(mockTargetSocket.character.output).toHaveBeenCalledWith('TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser');
      expect(socket.character.output).toHaveBeenCalledWith(`You offer your aItem to ${mockTargetSocket.character.name}.`);
    });

    test('should add offer to other user socket offers collection if existing offers exist', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      mockGetSocketByCharacterId.mockReturnValueOnce(socket);

      socket.character.name = 'TestUser';
      socket.inventory = [item];

      let existingItem = new Item({ name: 'aDifferentItem' });

      let existingOffer = {
        fromUserName: 'TestUser2',
        toUserName: 'aUser',
        item: existingItem,
      };

      mockTargetSocket.character.offers = [existingOffer];
      expect.assertions(9);

      sut.execute(socket.character, item, 0, mockTargetSocket.character);

      expect(mockTargetSocket.character.offers).toHaveLength(2);

      expect(mockTargetSocket.character.offers[0].fromUserName).toBe(existingOffer.fromUserName);
      expect(mockTargetSocket.character.offers[0].toUserName).toBe(existingOffer.toUserName);
      expect(mockTargetSocket.character.offers[0].item).toBe(existingItem);

      expect(mockTargetSocket.character.offers[1].fromUserName).toBe(socket.character.name);
      expect(mockTargetSocket.character.offers[1].toUserName).toBe(socket.character.name);
      expect(mockTargetSocket.character.offers[1].item.id).toBe(item.id);

      expect(mockTargetSocket.character.output).toHaveBeenCalledWith('TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser');
      expect(socket.character.output).toHaveBeenCalledWith(`You offer your aItem to ${mockTargetSocket.character.name}.`);
    });

    // todo: is this testing what it's supposed to?
    test('should remove offer if it is not taken before the timeout', () => {
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      getCharacterNamesResult = ['TestUser', 'aUser'];

      socket.character.name = 'TestUser';
      socket.inventory = [item];
      expect.assertions(1);

      sut.execute(socket.character, item, 0, mockTargetSocket.character);

      expect(mockTargetSocket.character.offers).toHaveLength(1);
    });
  });

});
