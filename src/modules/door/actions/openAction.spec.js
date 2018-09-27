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
    test('should call room.openDoor', () => {
      expect.assertions(1);

      return sut.execute(socket.character, directions.NE).then(() => {
        expect(socket.character.output).toHaveBeenCalled();
      });

    });
  });
});
