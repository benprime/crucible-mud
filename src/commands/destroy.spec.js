import { mockGetRoomById } from '../models/room';
import { mockAutocompleteMultiple } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './destroy';
import Item from '../models/item';

jest.mock('../models/room');
jest.mock('../core/autocomplete');

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
        expect.assertions(1);

        // act
        return sut.execute(socket.character, 'mob', 'not found name').catch(() => {
          // assert
          expect(socket.character.output).toHaveBeenCalledWith('Mob not found.');
        });


      });

      test('should remove mob from room and output messages when successful', () => {
        // arrange
        const mob = mocks.getMockMob();
        mockAutocompleteMultiple.mockReturnValueOnce({ item: mob });
        mockRoom.mobs = [mob];
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'mob', 'mob name').then(() => {
          // assert
          expect(socket.character.output).toHaveBeenCalledWith('Mob successfully destroyed.');
          expect(socket.character.toRoom).toHaveBeenCalledWith(`TestUser erases ${mob.displayName} from existence!`, [socket.character.id]);
          expect(mockRoom.mobs).toHaveLength(0);
        });
      });
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
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'item', 'non-existant item').catch(() => {

          // assert
          expect(socket.character.output).toHaveBeenCalledWith('You don\'t seem to be carrying that item.');
          expect(socket.character.inventory).toHaveLength(1);
          expect(socket.character.save).not.toHaveBeenCalled();
        });

      });

      test('should remove item from inventory when successful', () => {
        // arrange
        let item = new Item({
          name: 'item name',
        });
        mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
        socket.character.inventory.push(item);
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'item', 'item name').then(() => {
          // assert
          expect(socket.character.output).toHaveBeenCalledWith('Item successfully destroyed.');
          expect(socket.character.inventory).toHaveLength(0);
          expect(socket.character.save).toHaveBeenCalledTimes(1);
        });


      });
    });

    test('should output error when type parameter is invalid', () => {
      expect.assertions(3);

      // act
      return sut.execute(socket.character, 'invalid type', 'name of thing to destroy').catch(() => {
        // assert
        expect(socket.character.output).toHaveBeenCalledWith('Invalid destroy type.');
        expect(socket.character.inventory).toHaveLength(0);
        expect(socket.character.save).not.toHaveBeenCalled();
      });


    });

    test('should be an admin command', () => {
      expect(sut.admin).toBe(true);
    });

  });

});
