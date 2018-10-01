import { mockGetRoomById } from '../../../models/room';
import mocks from '../../../../spec/mocks';
import sut from './spawnAction';

jest.mock('../../../models/room');

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
        const result = sut.execute(socket.character, 'mob', 'name');
        expect(result).toBe(false);
        expect(socket.character.output).toHaveBeenCalledWith('Unknown mob type.');
      });
    });

    test('should create instance of mob in room mobs list', () => {

      const result = sut.execute(socket.character, 'mob', 'kobold');
      expect(result).toBe(true);
      expect(mockRoom.mobs).toHaveLength(1);
      expect(mockRoom.mobs[0].displayName.endsWith('kobold sentry')).toBeTruthy();
      expect(socket.character.output).toHaveBeenCalledWith('Summoning successful.');
      expect(socket.character.toRoom).toHaveBeenCalledWith(`TestUser waves his hand and a ${mockRoom.mobs[0].displayName} appears!`, [socket.character.id]);
      expect(mockRoom.save).not.toHaveBeenCalled();
    });
  });

  describe('when type is item', () => {
    test('should output message when type name is invalid', () => {
      const result = sut.execute(socket.character, 'item', 'name');
      expect(result).toBe(false);
      expect(socket.character.output).toHaveBeenCalledWith('Attempted to spawn unknown item type: name');
    });

    test('should create instance of item in user inventory', () => {
      const result = sut.execute(socket.character, 'item', 'short sword');
      expect(result).toBe(true);
      expect(socket.character.inventory).toHaveLength(1);
      expect(socket.character.inventory[0].name).toBe('short sword');
      expect(socket.character.output).toHaveBeenCalledWith('Item created.');
      expect(socket.character.toRoom).toHaveBeenCalledWith('TestUser emits a wave of energy!', [socket.character.id]);
      expect(socket.character.save).toHaveBeenCalled();
    });
  });

  describe('when type is key', () => {
    test('should output message when type name is invalid', () => {
      const result = sut.execute(socket.character, 'key', 'name');
      expect(result).toBe(false);
      expect(socket.character.output).toHaveBeenCalledWith('Unknown key type.');
    });
  });

  test('should create instance of key in user keys', () => {
    const result = sut.execute(socket.character, 'key', 'jade key');
    expect(result).toBe(true);
    expect(socket.character.keys).toHaveLength(1);
    expect(socket.character.keys[0].name).toBe('jade key');
    expect(socket.character.output).toHaveBeenCalledWith('Key created.');
    expect(socket.character.save).toHaveBeenCalled();
  });

  test('should output message when object type is invalid', () => {
    const result = sut.execute(socket.character, 'unknownType', 'name');
    expect(result).toBe(false);
    expect(socket.character.output).toHaveBeenCalledWith('Unknown object type.');
  });
});
