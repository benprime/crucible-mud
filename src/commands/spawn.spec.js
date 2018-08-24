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
        return sut.execute(socket.character, 'mob', 'name').catch(response => {
          expect(response).toBe('Unknown mob type.');
        });
      });

      test('should create instance of mob in room mobs list', () => {
        return sut.execute(socket.character, 'mob', 'kobold').then(response => {
          expect(mockRoom.mobs).toHaveLength(1);
          expect(mockRoom.mobs[0].displayName.endsWith('kobold sentry')).toBeTruthy();
          expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'Summoning successful.' });
          expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'TestUser waves his hand and a kobold sentry appears!', exclude: [socket.character.id]});
          expect(mockRoom.save).not.toHaveBeenCalled();
        });
      });
    });

    describe('when type is item', () => {
      test('should output message when type name is invalid', () => {
        return sut.execute(socket.character, 'item', 'name').catch(response => {
          expect(response).toBe('Attempted to spawn unknown item type: name');
        });
      });

      test('should create instance of item in user inventory', () => {
        return sut.execute(socket.character, 'item', 'shortsword').then(response => {
          expect(socket.character.inventory).toHaveLength(1);
          expect(socket.character.inventory[0].displayName).toBe('short sword');
          expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'Item created.' });
          expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'TestUser emits a wave of energy!', exclude: [socket.character.id] });
          expect(socket.character.save).toHaveBeenCalled();
        });
      });
    });

    describe('when type is key', () => {
      test('should output message when type name is invalid', () => {
        return sut.execute(socket.character, 'key', 'name').catch(response => {
          expect(response).toBe('Unknown key type.');

        });
      });

      test('should create instance of key in user keys', () => {
        return sut.execute(socket.character, 'key', 'jadekey').then(response => {
          expect(socket.character.keys).toHaveLength(1);
          expect(socket.character.keys[0].displayName).toBe('jade key');
          expect(response).toBe('Key created.');
          expect(socket.character.save).toHaveBeenCalled();
        });
      });
    });

    test('should output message when object type is invalid', () => {
      return sut.execute(socket.character, 'unknownType', 'name').catch(response => {
        expect(response).toBe('Unknown object type.');

      });

    });
  });
});
