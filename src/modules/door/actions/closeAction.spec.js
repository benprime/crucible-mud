import { mockGetRoomById } from '../../../models/room';
import directions from '../../../core/directions';
import mocks from '../../../../spec/mocks';
import sut from './closeAction';

jest.mock('../../../models/room');


describe('close', () => {
  let socket;
  let mockRoom;

  beforeAll(() => {
    mockRoom = mocks.getMockRoom();
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    test('should call room.openDoor', () => {
      expect.assertions(1);

      return sut.execute(socket.character, directions.NE).then(() => {
        expect(mockRoom.closeDoor).toHaveBeenCalled();
      });

    });
  });

});
