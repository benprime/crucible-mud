import { mockGetById } from '../models/room';
import { mockGetSocketByUsername } from '../core/socketUtil';
import mocks from '../../spec/mocks';
import sut from './summon';


jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

global.io = new mocks.IOMock();
let mockTargetSocket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
mockGetById.mockReturnValue(mockRoom);

describe('summon', () => {
  let socket;
  let otherRoom;

  beforeEach(() => {
    mockRoom.name = 'OLD';
    otherRoom = mocks.getMockRoom();
    otherRoom.name = 'NEW';

    // acting admin socket
    socket = new mocks.SocketMock();
    socket.user.roomId = mockRoom.id;
    socket.user.username = 'TestUser';

    // target user socket
    mockTargetSocket = new mocks.SocketMock();
    mockTargetSocket.user.roomId = otherRoom.id;
    mockTargetSocket.user.username = 'OtherUser';

  });

  describe('execute', () => {
    test('should output message when user is not found', () => {
      mockTargetSocket = null;
      sut.execute(socket, 'Wrong');

      expect(socket.emit).toBeCalledWith('output', { message: 'Player not found.' });
    });

    test('should join target user to admin room and leave current room', () => {
      // arrange
      mockGetSocketByUsername.mockReturnValueOnce(mockTargetSocket);
      mockTargetSocket.user.roomId = otherRoom.id;

      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(mockTargetSocket.leave).toBeCalledWith(otherRoom.id);
      expect(mockTargetSocket.join).toBeCalledWith(mockRoom.id);
    });

    test('should update target user room id and save user to database', () => {
      // arrange
      mockGetSocketByUsername.mockReturnValueOnce(mockTargetSocket);
      mockTargetSocket.user.roomId = otherRoom.id;

      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(mockTargetSocket.user.roomId).toEqual(mockRoom.id);
      expect(mockTargetSocket.user.save).toHaveBeenCalled();
    });

    test('should output messages when command successful', () => {
      mockGetSocketByUsername.mockReturnValueOnce(mockTargetSocket);

      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(mockTargetSocket.emit).toBeCalledWith('output', { message: 'You were summoned to TestUser\'s room!' });
      expect(mockTargetSocket.broadcast.to(mockTargetSocket.user.roomId).emit).toBeCalledWith('output', { message: 'OtherUser appears out of thin air!' });
    });

    test('should be an admin command', () => {
      expect(sut.admin).toBe(true);
    });
  });
});
