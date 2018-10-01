import { mockGetRoomById } from '../../../models/room';
import directions from '../../../core/directions';
import mocks from '../../../../spec/mocks';
import sut from './openAction';


jest.mock('../../../models/room');

let mockRoom = mocks.getMockRoom();

describe('open', () => {
  let socket;

  beforeAll(() => {
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {

    beforeEach(() => {
      mockRoom.exits = [
        { dir: 'n', roomId: 'nRoomId', closed: true },
        { dir: 's', roomId: 'sRoomId', closed: false },
        { dir: 'e', roomId: 'eRoomId', keyName: 'someKey', locked: true, closed: true },
        { dir: 'w', roomId: 'wRoomId', keyName: 'someKey', locked: false, closed: false },
        { dir: 'se', roomId: 'seRoomId', keyName: 'someKey', locked: false, closed: true },
        { dir: 'sw', roomId: 'swRoomId' },
      ];
    });
    test('should output message when direction is invalid', () => {
      const result = sut.execute(socket.character, directions.NE);
      expect(socket.character.output).toBeCalledWith('There is no exit in that direction!');
      expect(result).toBe(false);

    });

    test('should output message when direction has no door', () => {
      const result = sut.execute(socket.character, directions.SW);
      const exit = mockRoom.exits.find(({ dir }) => dir === 'sw');

      expect(exit.hasOwnProperty('closed')).toBe(false);
      expect(socket.character.output).toBeCalledWith('There is no door in that direction!');
      expect(result).toBe(false);  });

    describe('when key is associated', () => {
      test('should fail and output message when door is locked and closed', () => {
        const result = sut.execute(socket.character, directions.E);
        const exit = mockRoom.exits.find(({ dir }) => dir === 'e');

        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(true);
        expect(exit.closed).toBe(true);
        expect(socket.character.output).toBeCalledWith('That door is locked.');
        expect(result).toBe(false);
      });

      test('should succeed and output message when door is unlocked and closed', () => {
        const result = sut.execute(socket.character, directions.SE);
        const exit = mockRoom.exits.find(({ dir }) => dir === 'se');
        expect(result).toBe(true);
        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(false);
        expect(exit.closed).toBe(false);

      });

      test('should send messages when door and is unlocked and open', () => {
        const result = sut.execute(socket.character, directions.W);
        const exit = mockRoom.exits.find(({ dir }) => dir === 'w');

        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(false);
        expect(exit.closed).toBe(false);
        expect(socket.character.output).toBeCalledWith('That door is already open.');
        expect(result).toBe(false);

      });
    });

    describe('when no key is associated', () => {
      test('should output message when door is closed', () => {
        const result = sut.execute(socket.character, directions.N);
        const exit = mockRoom.exits.find(({ dir }) => dir === 'n');
        expect(result).toBe(true);
        expect(exit.closed).toBe(false);
      });

      test('should output message when door is already open', () => {
        const result = sut.execute(socket.character, directions.S);
        expect(socket.character.output).toBeCalledWith('That door is already open.');
        expect(result).toBe(false);
      });
    });


  });
});
