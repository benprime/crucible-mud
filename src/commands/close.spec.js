import { mockGetRoomById, mockValidDirectionInput, mockShortToLong } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './close';

jest.mock('../models/room');
let mockRoom;
const socket = new mocks.SocketMock();
global.io = new mocks.IOMock();


describe('close', () => {

  describe('execute', () => {

    beforeEach(() => {
      mockRoom = {
        id: socket.character.roomId,
        inventory: [],
        mobs: [],
        exits: [
          { dir: 'n', roomId: 'nRoomId', closed: true },
          { dir: 's', roomId: 'sRoomId', closed: false },
          { dir: 'e', roomId: 'eRoomId' },
          { dir: 'w', roomId: 'wRoomId' },
        ],
      };
      mockGetRoomById.mockReturnValue(mockRoom);
    });

    test('should print message on invalid direction', () => {
      mockValidDirectionInput.mockReturnValueOnce('ne');
      return sut.execute(socket.character, 'ne').catch(response => {
        expect(response).toEqual('There is no exit in that direction!');
      });

    });

    test('should print message when no door exists in valid direction', () => {
      mockValidDirectionInput.mockReturnValueOnce('e');

      return sut.execute(socket.character, 'e').catch(response => {
        const exit = mockRoom.exits.find(({ dir }) => dir === 'e');

        expect(exit.hasOwnProperty('closed')).toBe(false);
        expect(response).toEqual('There is no door in that direction!');
      });
    });

    test('should be succesful when door is open', () => {
      mockValidDirectionInput.mockReturnValueOnce('s');
      mockShortToLong.mockReturnValueOnce('south');

      return sut.execute(socket.character, 's').then(response => {
        const exit = mockRoom.exits.find(({ dir }) => dir === 's');

        expect(exit.closed).toBe(true);
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'TestUser closes the door to the south.', exclude: [socket.character.id] });
        expect(response.charMessages).toContainEqual({charId: socket.character.id, message: 'Door closed.'});
      });

    });

    test('should be succesful when door is already closed', () => {
      mockValidDirectionInput.mockReturnValueOnce('n');
      mockShortToLong.mockReturnValueOnce('north');

      return sut.execute(socket.character, 'n').then(response => {
        const exit = mockRoom.exits.find(({ dir }) => dir === 'n');
        expect(exit.closed).toBe(true);
        expect(response.roomMessages).toContainEqual({roomId: socket.character.roomId, message: 'TestUser closes the door to the north.', exclude: [socket.character.id]});
        expect(response.charMessages).toContainEqual({charId: socket.character.id, message: 'Door closed.'});
      });
    });



  });

});
