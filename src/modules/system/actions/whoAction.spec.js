import { mockGetRoomById } from '../../../models/room';
import { mockGetAreaById, mockAreaCache } from '../../../models/area';
import mocks from '../../../../spec/mocks';
import sut from './whoAction';

jest.mock('../../../models/room');
jest.mock('../../../models/area');
global.io = new mocks.IOMock();

describe('who', () => {
  let mockRoom;
  let socket;
  let area;
  let t1;
  let t2;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    mockRoom = mocks.getMockRoom(socket.character.roomId);
    mockGetRoomById.mockReturnValue(mockRoom);
    t1 = new mocks.SocketMock();
    t2 = new mocks.SocketMock();
    t1.id = '1';
    t2.id = '2';
    t1.character.name = 'Test1';
    t2.character.name = 'Test2';
    global.io.reset();
    global.io.sockets.connected = {};
    global.io.sockets.connected[t1.id] = t1;
    global.io.sockets.connected[t2.id] = t2;

    area = {
      name: 'A dangerous area',
    };
    mockAreaCache['areaId'] = area;

    socket.emit.mockReset();
  });

  describe('execute', () => {
    test('should display online users', () => {
      expect.assertions(1);

      return sut.execute(socket.character).then(() => {
        expect(socket.character.output).toHaveBeenCalledWith('<span class="cyan"> -=- 2 Players Online -=-</span><br /><div class="mediumOrchid">Test1<br />Test2<br /></div>');
      });

    });

    test('should display areas when online users are in rooms that have areas', async () => {
      mockRoom.areaId = 'areaId';
      mockGetAreaById.mockReturnValueOnce(area);
      mockGetAreaById.mockReturnValueOnce(mocks.getMockRoom(socket.character.roomId));
      t2.character.roomId = 'room without area';
      expect.assertions(1);

      return sut.execute(socket.character).then(() => {
        expect(socket.character.output).toHaveBeenCalledWith('<span class="cyan"> -=- 2 Players Online -=-</span><br /><div class="mediumOrchid">Test1 (A dangerous area)<br />Test2<br /></div>');
      });

    });
  });
});
