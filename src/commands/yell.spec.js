import { mockGetRoomById, mockShortToLong, mockOppositeDirection } from '../models/room';
import { when } from 'jest-when';
import mocks from '../../spec/mocks';
import sut from './yell';


jest.mock('../models/room');

const mockRoom = mocks.getMockRoom();


describe('yell', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.character.roomId = mockRoom.id;

    const msg = 'This is a yelled message!';
    mockGetRoomById.mockReturnValue(mockRoom);

    // using jest-when library
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

    sut.execute(socket, msg);
  });

  describe('execute', () => {

    test('should send message to actioning player', () => {
      expect(socket.emit).toBeCalledWith('output', { message: 'You yell \'This is a yelled message!\'' });
    });

    test('should send message to local rooms', () => {
      expect(socket.broadcast.to(mockRoom.id).emit).toBeCalledWith('output', { message: `${socket.user.username} yells 'This is a yelled message!'` });
    });

    test('should send message to surrounding rooms', () => {
      expect(socket.broadcast.to(mockRoom.roomIds.u).emit).toBeCalledWith('output', { message: 'Someone yells from below  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.d).emit).toBeCalledWith('output', { message: 'Someone yells from above  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.n).emit).toBeCalledWith('output', { message: 'Someone yells from the south  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.s).emit).toBeCalledWith('output', { message: 'Someone yells from the north  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.e).emit).toBeCalledWith('output', { message: 'Someone yells from the west  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.w).emit).toBeCalledWith('output', { message: 'Someone yells from the east  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.ne).emit).toBeCalledWith('output', { message: 'Someone yells from the southwest  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.se).emit).toBeCalledWith('output', { message: 'Someone yells from the northwest  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.nw).emit).toBeCalledWith('output', { message: 'Someone yells from the southeast  \'This is a yelled message!\'' });
      expect(socket.broadcast.to(mockRoom.roomIds.sw).emit).toBeCalledWith('output', { message: 'Someone yells from the northeast  \'This is a yelled message!\'' });
    });

  });
});
