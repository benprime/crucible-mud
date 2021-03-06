import { mockGetRoomById } from '../../../models/room';
import { mockAutocompleteMultiple, mockAutocompleteCharacter } from '../../../core/autocomplete';
import mocks from '../../../../spec/mocks';
import sut from './acceptAction';
import Item from '../../../models/item';
import { Types } from 'mongoose';
const { ObjectId } = Types;

jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');
jest.mock('../../../core/socketUtil');

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
      mockAutocompleteMultiple.mockReset();
    });

    test('should update from/to inventory on successful offer/accept', () => {
      let offeringSocket = new mocks.SocketMock();
      let offeredItem = new Item();
      offeredItem._id = new ObjectId();
      offeredItem.name = 'aItem';

      mockAutocompleteCharacter.mockReturnValueOnce(offeringSocket.character);

      offeringSocket.character.name = 'aUser';
      offeringSocket.character.name = 'aUser';
      offeringSocket.character.inventory = [offeredItem];
      offeringSocket.character.roomId = socket.character.roomId;

      socket.character.offers = [{
        fromUserName: offeringSocket.character.name,
        toUserName: socket.character.name,
        item: offeredItem,
      }];

      sut.execute(socket.character, offeringSocket.character);

      expect(socket.character.offers).toHaveLength(0);
      expect(socket.character.output).toHaveBeenCalledWith(`You accept the ${offeredItem.name} from ${offeringSocket.character.name}.`);
      expect(socket.character.save).toHaveBeenCalled();
      expect(socket.character.inventory).toHaveLength(1);
      expect(socket.character.inventory[0].name).toEqual('aItem');

      expect(offeringSocket.character.output).toHaveBeenCalledWith(`${socket.character.name} accepts the ${offeredItem.name}.`);
      expect(offeringSocket.character.save).toHaveBeenCalled();
      expect(offeringSocket.character.inventory).toHaveLength(0);
    });
  });
});
