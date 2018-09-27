import { mockGetRoomById } from '../../../models/room';
import { mockRoomMessage } from '../../../core/socketUtil';
import mocks from '../../../../spec/mocks';
import sut from './yellAction';


jest.mock('../../../models/room');
jest.mock('../../../core/socketUtil');

const mockRoom = mocks.getMockRoom();
const msg = 'This is a yelled message!';
global.io = new mocks.IOMock();

describe('yell', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.character.roomId = mockRoom.id;
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  describe('execute', () => {

    test('should send message to actioning player', () => {
      expect.assertions(1);
      return sut.execute(socket.character, msg).then(() => {
        expect(socket.character.output).toHaveBeenCalledWith('You yell \'This is a yelled message!\'');
      });
    });

    test('should send message to local rooms', () => {
      expect.assertions(1);
      return sut.execute(socket.character, msg).then(() => {
        expect(mockRoomMessage).toHaveBeenCalledWith(socket.character.roomId, `${socket.character.name} yells 'This is a yelled message!'`, [socket.character.id]);
      });
    });

    test('should send message to surrounding rooms', () => {
      expect.assertions(10);
      return sut.execute(socket.character, msg).then(() => {
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.u, 'Someone yells from below  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.d, 'Someone yells from above  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.n, 'Someone yells from the south  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.s, 'Someone yells from the north  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.e, 'Someone yells from the west  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.w, 'Someone yells from the east  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.ne, 'Someone yells from the southwest  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.se, 'Someone yells from the northwest  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.nw, 'Someone yells from the southeast  \'This is a yelled message!\'');
        expect(mockRoomMessage).toHaveBeenCalledWith(mockRoom.roomIds.sw, 'Someone yells from the northeast  \'This is a yelled message!\'');
      });

    });

  });
});
