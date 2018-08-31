import { mockGetRoomById, mockShortToLong, mockOppositeDirection } from '../models/room';
import { when } from 'jest-when';
import mocks from '../../spec/mocks';
import sut from './yell';


jest.mock('../models/room');

const mockRoom = mocks.getMockRoom();
const msg = 'This is a yelled message!';

describe('yell', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.character.roomId = mockRoom.id;

    mockGetRoomById.mockReturnValue(mockRoom);

    when(mockOppositeDirection).calledWith('n').mockReturnValue('s');
    when(mockOppositeDirection).calledWith('s').mockReturnValue('n');
    when(mockOppositeDirection).calledWith('e').mockReturnValue('w');
    when(mockOppositeDirection).calledWith('w').mockReturnValue('e');
    when(mockOppositeDirection).calledWith('ne').mockReturnValue('sw');
    when(mockOppositeDirection).calledWith('nw').mockReturnValue('se');
    when(mockOppositeDirection).calledWith('se').mockReturnValue('nw');
    when(mockOppositeDirection).calledWith('sw').mockReturnValue('ne');

    when(mockShortToLong).calledWith('n').mockReturnValue('north');
    when(mockShortToLong).calledWith('s').mockReturnValue('south');
    when(mockShortToLong).calledWith('e').mockReturnValue('east');
    when(mockShortToLong).calledWith('w').mockReturnValue('west');
    when(mockShortToLong).calledWith('ne').mockReturnValue('northeast');
    when(mockShortToLong).calledWith('nw').mockReturnValue('northwest');
    when(mockShortToLong).calledWith('se').mockReturnValue('southeast');
    when(mockShortToLong).calledWith('sw').mockReturnValue('southwest');
  });

  describe('execute', () => {

    test('should send message to actioning player', () => {
      expect.assertions(1);
      return sut.execute(socket.character, msg).then((response) => {
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'You yell \'This is a yelled message!\'' });
      });
    });

    test('should send message to local rooms', () => {
      expect.assertions(1);
      return sut.execute(socket.character, msg).then((response) => {
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `${socket.character.name} yells 'This is a yelled message!'`, exclude: [socket.character.id] });
      });
    });

    test('should send message to surrounding rooms', () => {
      expect.assertions(10);
      return sut.execute(socket.character, msg).then((response) => {
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.u, message: 'Someone yells from below  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.d, message: 'Someone yells from above  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.n, message: 'Someone yells from the south  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.s, message: 'Someone yells from the north  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.e, message: 'Someone yells from the west  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.w, message: 'Someone yells from the east  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.ne, message: 'Someone yells from the southwest  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.se, message: 'Someone yells from the northwest  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.nw, message: 'Someone yells from the southeast  \'This is a yelled message!\'' });
        expect(response.roomMessages).toContainEqual({ roomId: mockRoom.roomIds.sw, message: 'Someone yells from the northeast  \'This is a yelled message!\'' });
      });

    });

  });
});
