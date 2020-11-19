import { mockGetRoomById } from '../../../models/room';
import { mockAutocompleteMultiple } from '../../../core/autocomplete';
import mocks from '../../../../spec/mocks';
import sut from './destroyAction';
import Item from '../../../models/item';

jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');

let mockRoom = mocks.getMockRoom();


describe('destroy', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  beforeEach(() => {
    socket.reset();
    socket.character.inventory = [];
  });

  describe('execute', () => {

    describe('when type is mob', () => {

      test('should do nothing when mob is not found', () => {
        // arrange
        mockRoom.mobs = [{}];
        mockAutocompleteMultiple.mockReturnValueOnce(null);
        // act
        sut.execute(socket.character, 'mob', 'not found name');

        // assert
        expect(socket.character.output).toHaveBeenCalledWith('Mob not found.');
      });

      test('should remove mob from room and output messages when successful', () => {
        // arrange
        const mob = mocks.getMockMob();
        mockAutocompleteMultiple.mockReturnValueOnce({ item: mob });
        mockRoom.mobs = [mob];

        // act
        sut.execute(socket.character, 'mob', 'mob name');

        // assert
        expect(socket.character.output).toHaveBeenCalledWith('Mob successfully destroyed.');
        expect(socket.character.toRoom).toHaveBeenCalledWith(`TestUser erases ${mob.displayName} from existence!`, [socket.character.id]);
        expect(mockRoom.mobs).toHaveLength(0);
      });

      describe('when type is item', () => {
        beforeEach(() => {
          socket.reset();
          mockRoom.reset();
        });

        test('should do nothing when inventory does not contain item', () => {
          // arrange
          let item = new Item({
            name: 'item name',
          });
          socket.character.inventory.push(item);
          mockAutocompleteMultiple.mockReturnValueOnce(null);

          // act
          sut.execute(socket.character, 'item', 'non-existant item');

          
          // assert
          expect(socket.character.output).toHaveBeenCalledWith('You don\'t seem to be carrying that item.');
          expect(socket.character.inventory).toHaveLength(1);
          expect(socket.character.save).not.toHaveBeenCalled();
        });

        test('should remove item from inventory when successful', () => {
          // arrange
          let item = new Item({
            name: 'item name',
          });
          mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
          socket.character.inventory.push(item);

          // act
          sut.execute(socket.character, 'item', 'item name');

          // assert
          expect(socket.character.output).toHaveBeenCalledWith('Item successfully destroyed.');
          expect(socket.character.inventory).toHaveLength(0);
          expect(socket.character.save).toHaveBeenCalledTimes(1);
        });
      });
    });

    test('should output error when type parameter is invalid', () => {

      // act
      sut.execute(socket.character, 'invalid type', 'name of thing to destroy');

      // assert
      expect(socket.character.output).toHaveBeenCalledWith('Invalid destroy type.');
      expect(socket.character.inventory).toHaveLength(0);
      expect(socket.character.save).not.toHaveBeenCalled();
    });
  });

});
