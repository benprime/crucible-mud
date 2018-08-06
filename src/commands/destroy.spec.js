import { mockGetById } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './destroy';

jest.mock('../models/room');
jest.mock('../core/autocomplete');

let mockRoom = mocks.getMockRoom();


describe('destroy', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    mockGetById.mockReturnValue(mockRoom);
  });

  beforeEach(() => {
    socket.reset();
  });

  describe('execute', () => {

    describe('when type is mob', () => {

      test('should do nothing when mob is not found', () => {
        // arrange
        mockAutocompleteTypes.mockReturnValueOnce(null);

        // act
        sut.execute(socket, 'mob', 'not found name');

        // assert
        expect(socket.emit).not.toHaveBeenCalled();

        expect(mockRoom.mobs.remove).not.toHaveBeenCalled();
      });

      test('should remove mob from room and output messages when successful', () => {
        // arrange
        mockAutocompleteTypes.mockReturnValueOnce({});

        // act
        sut.execute(socket, 'mob', 'mob name');

        // assert
        expect(socket.emit).toHaveBeenCalledTimes(1);
        expect(socket.emit).toBeCalledWith('output', { message: 'Mob successfully destroyed.' });
        expect(mockRoom.mobs.remove).toHaveBeenCalledTimes(1);
      });
    });

    describe('when type is item', () => {
      beforeEach(() => {
        socket.reset();
        mockRoom.reset();
      });

      test('should do nothing when inventory does not contain item', () => {
        // arrange
        mockAutocompleteTypes.mockReturnValueOnce(null);

        // act
        sut.execute(socket, 'item', 'non-existant item');

        // assert
        expect(socket.emit).not.toHaveBeenCalled();
        expect(socket.user.inventory.remove).not.toHaveBeenCalled();
        expect(socket.user.save).not.toHaveBeenCalled();
      });

      test('should remove item from inventory when successful', () => {
        // arrange
        let item = {};
        mockAutocompleteTypes.mockReturnValueOnce({});

        // act
        sut.execute(socket, 'item', 'item name');

        // assert
        expect(socket.emit).toHaveBeenCalledTimes(1);
        expect(socket.emit).toBeCalledWith('output', { message: 'Item successfully destroyed.' });
        expect(socket.user.inventory.remove).toBeCalledWith(item);
        expect(socket.user.save).toHaveBeenCalledTimes(1);
      });
    });

    test('should output error when create type is invalid', () => {
      // act
      sut.execute(socket, 'invalid type', 'name of thing to destroy');

      // assert
      expect(socket.emit).toHaveBeenCalledTimes(1);
      expect(socket.emit).toBeCalledWith('output', { message: 'Invalid destroy type.' });
      expect(socket.user.inventory.remove).not.toHaveBeenCalled();
      expect(socket.user.save).not.toHaveBeenCalled();
    });

    test('should be an admin command', () => {
      expect(sut.admin).toBe(true);
    });

  });

});
