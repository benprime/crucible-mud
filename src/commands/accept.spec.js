import { mockGetRoomById } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import { mockCharacterInRoom } from '../core/socketUtil';
import mocks from '../../spec/mocks';
import sut from './accept';
import Item from '../models/item';
import { Types } from 'mongoose';
const { ObjectId } = Types;

jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

global.io = new mocks.IOMock();
let socket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
mockGetRoomById.mockReturnValue(mockRoom);


describe('accept', () => {

  describe('execute', () => {

    beforeEach(() => {
      socket.reset();
      socket.emit.mockReset();
      socket.character.save.mockReset();
      mockAutocompleteTypes.mockReset();
    });

    test('should update from/to inventory on successful offer/accept', () => {
      let offeringSocket = new mocks.SocketMock();
      let offeredItem = new Item();
      offeredItem._id = new ObjectId();
      offeredItem.name = 'aItem';
      offeredItem.displayName = 'aItem display name';

      mockAutocompleteTypes.mockReturnValueOnce({item: offeringSocket.user});
      //mockReturnValueOnce({ item: offeredItem })
      //mockGetSocketByUsername.mockReturnValueOnce(offeringSocket);
      mockCharacterInRoom.mockReturnValueOnce(offeringSocket);

      offeringSocket.user.username = 'aUser';
      offeringSocket.character.inventory = [offeredItem];

      socket.character.offers = [{
        fromUserName: offeringSocket.user.username,
        toUserName: socket.user.username,
        item: offeredItem,
      }];

      sut.execute(socket.character, 'aItem');

      expect(socket.character.offers).toHaveLength(0);
      //expect(socket.emit).toBeCalledWith('output', { message: `You accept the ${offeredItem.displayName} from ${offeringSocket.user.username}.` });
      expect(socket.character.save).toHaveBeenCalled();
      expect(socket.character.inventory).toHaveLength(1);
      expect(socket.character.inventory[0].name).toEqual('aItem');

      //expect(offeringSocket.emit).toBeCalledWith('output', { message: `${socket.user.username} accepts the ${offeredItem.displayName}.` });
      expect(offeringSocket.character.save).toHaveBeenCalled();
      expect(offeringSocket.character.inventory).toHaveLength(0);
    });
  });
});
