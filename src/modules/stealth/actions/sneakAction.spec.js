import { mockGetRoomById } from '../../../models/room';
import mocks from '../../../../spec/mocks';

jest.mock('../../../models/room');
jest.mock('../../../core/dice');

let mockRoom;
global.io = new mocks.IOMock();

describe('sneak', function () {
  let socket;

  beforeEach(function () {
    socket = new mocks.SocketMock();
    socket.user.stealth = 0;
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true, hidden: false },
      ],
      inventory: [
        { name: 'ring', hidden: false },
      ],
      save: jasmine.createSpy('roomSave'),
    };
    mockGetRoomById.mockReturnValueOnce(mockRoom);
  });

  test('character should not generate enter and exit messages when sneaking', () => {
  });

  test('character should generate enter and exit messages after revealed', () => {
  });

  test('character should not generate movement noise messages when sneaking', () => {
  });

  test('character should generate movement noise messages after revealed', () => {
  });

  test('should not appear in room description when sneaking', () => {
  });

  test('should appear in room description when revealed', () => {
  });

});
