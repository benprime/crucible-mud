import { mockGetRoomById, mockValidDirectionInput, mockShortToLong } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './open';


jest.mock('../models/room');

let mockRoom = mocks.getMockRoom();

describe('open', () => {
  let socket;

  beforeAll(() => {
    mockRoom = {
      inventory: [],
      mobs: [],
      exits: [
        { dir: 'n', roomId: 'nRoomId', closed: true },
        { dir: 's', roomId: 'sRoomId', closed: false },
        { dir: 'e', roomId: 'eRoomId', keyName: 'someKey', locked: true, closed: true },
        { dir: 'w', roomId: 'wRoomId', keyName: 'someKey', locked: false, closed: false },
        { dir: 'se', roomId: 'seRoomId', keyName: 'someKey', locked: false, closed: true },
        { dir: 'sw', roomId: 'swRoomId' },
      ],
    };
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    test('should output message when direction is invalid', () => {
      mockValidDirectionInput.mockReturnValueOnce(null);

      return sut.execute(socket.character, 'ne').catch(response => {
        expect(response).toEqual('There is no exit in that direction!');
      });

    });

    test('should output message when direction has no door', () => {
      mockValidDirectionInput.mockReturnValueOnce('sw');

      return sut.execute(socket.character, 'sw').catch(response => {
        const exit = mockRoom.exits.find(({ dir }) => dir === 'sw');

        expect(exit.hasOwnProperty('closed')).toBe(false);
        expect(response).toEqual('There is no door in that direction!');
      });
    });

    describe('when key is associated', () => {
      test('should fail and output message when door is locked and closed', () => {
        mockValidDirectionInput.mockReturnValueOnce('e');

        return sut.execute(socket.character, 'e').catch(response => {
          const exit = mockRoom.exits.find(({ dir }) => dir === 'e');

          expect(exit.keyName).toBe('someKey');
          expect(exit.locked).toBe(true);
          expect(exit.closed).toBe(true);
          expect(response).toEqual('That door is locked.');
        });

      });

      test('should succeed and output message when door is unlocked and closed', () => {
        mockValidDirectionInput.mockReturnValueOnce('se');
        mockShortToLong.mockReturnValueOnce('southeast');

        return sut.execute(socket.character, 'se').then(response => {
          const exit = mockRoom.exits.find(({ dir }) => dir === 'se');

          expect(exit.keyName).toBe('someKey');
          expect(exit.locked).toBe(false);
          expect(exit.closed).toBe(false);
          expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'TestUser opens the door to the southeast.' });
          expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'Door opened.' });
        });

      });

      test('should send messages when door and is unlocked and open', () => {
        mockValidDirectionInput.mockReturnValueOnce('w');

        return sut.execute(socket.character, 'w').catch(response => {
          const exit = mockRoom.exits.find(({ dir }) => dir === 'w');

          expect(exit.keyName).toBe('someKey');
          expect(exit.locked).toBe(false);
          expect(exit.closed).toBe(false);
          expect(response).toEqual('That door is already open.');
        });

      });
    });

    describe('when no key is associated', () => {
      test('should output message when door is closed', () => {
        mockValidDirectionInput.mockReturnValueOnce('n');
        mockShortToLong.mockReturnValueOnce('north');
        return sut.execute(socket.character, 'n').then(response => {
          const exit = mockRoom.exits.find(({ dir }) => dir === 'n');

          expect(exit.closed).toBe(false);
          expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'TestUser opens the door to the north.' });
          expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'Door opened.' });
        });

      });

      test('should output message when door is already open', () => {
        mockValidDirectionInput.mockReturnValueOnce('s');
        return sut.execute(socket.character, 's').catch(response => {
          const exit = mockRoom.exits.find(({ dir }) => dir === 's');

          expect(exit.closed).toBe(false);
          expect(response).toEqual('That door is already open.');
        });

      });
    });


  });
});
