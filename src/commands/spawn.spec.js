import { mockGetRoomById } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './spawn';

jest.mock('../models/room');

let mockRoom = mocks.getMockRoom();
mockGetRoomById.mockReturnValue(mockRoom);

describe('spawn', () => {
  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    describe('when type is mob', () => {
      test('should output message when type name is invalid', () => {
        sut.execute(socket, 'mob', 'name');

        expect(socket.emit).toBeCalledWith('output', { message: 'Unknown mob type.' });
      });

      test('should create instance of mob in room mobs list', () => {
        sut.execute(socket, 'mob', 'kobold');

        expect(mockRoom.mobs).toHaveLength(1);
        expect(mockRoom.mobs[0].displayName.endsWith('kobold sentry')).toBeTruthy();
        expect(socket.emit).toBeCalledWith('output', { message: 'Summoning successful.' });
        expect(mockRoom.save).not.toHaveBeenCalled();
      });
    });

    describe('when type is item', () => {
      test('should output message when type name is invalid', () => {
        sut.execute(socket, 'item', 'name');

        expect(socket.emit).toBeCalledWith('output', { message: 'Unknown item type.' });
      });

      test('should create instance of item in user inventory', () => {
        sut.execute(socket, 'item', 'shortsword');

        expect(socket.character.inventory).toHaveLength(1);
        expect(socket.character.inventory[0].displayName).toBe('short sword');
        expect(socket.emit).toBeCalledWith('output', { message: 'Item created.' });
        expect(socket.character.save).toHaveBeenCalled();
      });
    });

    describe('when type is key', () => {
      test('should output message when type name is invalid', () => {
        sut.execute(socket, 'key', 'name');

        expect(socket.emit).toBeCalledWith('output', { message: 'Unknown key type.' });
      });

      test('should create instance of key in user keys', () => {
        sut.execute(socket, 'key', 'jadekey');

        expect(socket.character.keys).toHaveLength(1);
        expect(socket.character.keys[0].displayName).toBe('jade key');
        expect(socket.emit).toBeCalledWith('output', { message: 'Key created.' });
        expect(socket.character.save).toHaveBeenCalled();
      });
    });

    test('should output message when object type is invalid', () => {
      sut.execute(socket, 'unknownType', 'name');

      expect(socket.emit).toBeCalledWith('output', { message: 'Unknown object type.' });
    });
  });
});
