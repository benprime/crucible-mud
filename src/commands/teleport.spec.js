import { mockGetRoomById, mockRoomCache } from '../models/room';
import { mockGetSocketByUsername } from '../core/socketUtil';
import { when } from 'jest-when';
import mocks from '../../spec/mocks';
import sut from './teleport';


jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');


describe('teleport', () => {
  let socket;
  let otherSocket;
  let currentRoom;
  let otherRoom;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.user.username = 'TestUser';

    otherSocket = new mocks.SocketMock();
    otherSocket.user.username = 'OtherUser';

    currentRoom = mocks.getMockRoom(socket.user.roomId);
    currentRoom.name = 'OLD';

    otherRoom = mocks.getMockRoom(otherSocket.user.roomId);
    otherRoom.name = 'NEW';

    mockRoomCache[currentRoom.id] = currentRoom;
    mockRoomCache[otherRoom.id] = otherRoom;

    when(mockGetRoomById).calledWith(currentRoom.id).mockReturnValue(currentRoom);
    when(mockGetRoomById).calledWith(otherRoom.id).mockReturnValue(otherRoom);

    global.io = new mocks.IOMock();
  });

  beforeEach(() => {
    mockGetSocketByUsername.mockReset();
  });

  describe('execute', () => {

    test('should teleport to another user\'s room if parameter is a username', () => {
      mockGetSocketByUsername.mockReturnValueOnce(otherSocket);

      // teleport to user
      sut.execute(socket, 'OtherUser');

      // check current room
      expect(socket.user.roomId).toEqual(otherRoom.id);
      expect(socket.user.save).toHaveBeenCalled();
    });

    test('should teleport to room if parameter is a room', () => {
      mockGetSocketByUsername.mockReturnValueOnce(otherSocket);

      // set current room

      //console.log(Room.roomCache)

      // teleport to room
      sut.execute(socket, otherRoom.id);

      // check current room
      expect(socket.user.roomId).toEqual(otherRoom.id);
      expect(socket.user.save).toHaveBeenCalled();

    });

    test('should output messages when target is invalid user', () => {
      // arrange
      mockGetSocketByUsername.mockReturnValueOnce(null);

      // act
      sut.execute(socket, 'Bobby');

      // assert
      expect(socket.emit).toBeCalledWith('output', { message: 'Target not found.' });
    });

    test('should be an admin command', () => {
      expect(sut.admin).toBe(true);
    });

  });
});
