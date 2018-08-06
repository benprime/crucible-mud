import { mockGetById, mockValidDirectionInput, mockShortToLong, mockOppositeDirection, mockRoomCache } from '../models/room';
import mocks from '../../spec/mocks';
import { when } from 'jest-when';
import sut from './move';

jest.mock('../models/room');
jest.mock('./break');

global.io = new mocks.IOMock();


describe('move', () => {
  let socket;
  let currentRoom;

  let uRoom;
  let dRoom;
  let nRoom;
  let sRoom;
  let eRoom;
  let wRoom;

  beforeAll(() => {
    when(mockOppositeDirection).calledWith('e').mockReturnValue('w');
    when(mockOppositeDirection).calledWith('w').mockReturnValue('e');
    when(mockOppositeDirection).calledWith('n').mockReturnValue('s');
    when(mockOppositeDirection).calledWith('s').mockReturnValue('n');
    when(mockOppositeDirection).calledWith('u').mockReturnValue('d');
    when(mockOppositeDirection).calledWith('d').mockReturnValue('u');

    when(mockValidDirectionInput).calledWith('e').mockReturnValue('e');
    when(mockValidDirectionInput).calledWith('w').mockReturnValue('w');
    when(mockValidDirectionInput).calledWith('n').mockReturnValue('n');
    when(mockValidDirectionInput).calledWith('s').mockReturnValue('s');
    when(mockValidDirectionInput).calledWith('u').mockReturnValue('u');
    when(mockValidDirectionInput).calledWith('d').mockReturnValue('d');

    when(mockShortToLong).calledWith('e').mockReturnValue('east');
    when(mockShortToLong).calledWith('w').mockReturnValue('west');
    when(mockShortToLong).calledWith('n').mockReturnValue('north');
    when(mockShortToLong).calledWith('s').mockReturnValue('south');
    when(mockShortToLong).calledWith('u').mockReturnValue('up');
    when(mockShortToLong).calledWith('d').mockReturnValue('down');

    socket = new mocks.SocketMock();
    currentRoom = mocks.getMockRoom(socket.user.roomId);
    uRoom = mocks.getMockRoom(currentRoom.exits.find(e => e.dir === 'u').roomId);
    uRoom.exits = [{ roomId: currentRoom.id, dir: 'd' }];
    dRoom = mocks.getMockRoom(currentRoom.exits.find(e => e.dir === 'd').roomId);
    dRoom.exits = [{ roomId: currentRoom.id, dir: 'u' }];
    nRoom = mocks.getMockRoom(currentRoom.exits.find(e => e.dir === 'n').roomId);
    nRoom.exits = [{ roomId: currentRoom.id, dir: 's' }];
    sRoom = mocks.getMockRoom(currentRoom.exits.find(e => e.dir === 's').roomId);
    sRoom.exits = [{ roomId: currentRoom.id, dir: 'n' }];
    eRoom = mocks.getMockRoom(currentRoom.exits.find(e => e.dir === 'e').roomId);
    eRoom.exits = [{ roomId: currentRoom.id, dir: 'w' }];
    wRoom = mocks.getMockRoom(currentRoom.exits.find(e => e.dir === 'w').roomId);
    wRoom.exits = [{ roomId: currentRoom.id, dir: 'e' }];

    when(mockGetById).calledWith(currentRoom.id).mockReturnValue(currentRoom);
    when(mockGetById).calledWith(uRoom.id).mockReturnValue(uRoom);
    when(mockGetById).calledWith(dRoom.id).mockReturnValue(dRoom);
    when(mockGetById).calledWith(nRoom.id).mockReturnValue(nRoom);
    when(mockGetById).calledWith(sRoom.id).mockReturnValue(sRoom);
    when(mockGetById).calledWith(eRoom.id).mockReturnValue(eRoom);
    when(mockGetById).calledWith(wRoom.id).mockReturnValue(wRoom);

    mockRoomCache[uRoom.id] = uRoom;
    mockRoomCache[dRoom.id] = dRoom;
    mockRoomCache[nRoom.id] = nRoom;
    mockRoomCache[sRoom.id] = sRoom;
    mockRoomCache[eRoom.id] = eRoom;
    mockRoomCache[wRoom.id] = wRoom;
  });

  beforeEach(() => {
    //jest.clearAllMocks();
    socket.user.roomId = currentRoom.id;
    //global.io.reset();

    // working around the closed-door tests
    // for(let i in mockRoomCache) {
    //   mockRoomCache[i].exits.forEach(e => e.closed = false);
    // }
  });

  // describe('dispatch', () => {
  //   beforeEach(() => {
  //     jest.spyOn(sut, 'execute');
  //     //global.io.reset();
  //   });

  //   test('should call execute with direction match', () => {
  //     sut.dispatch(socket, ['aMatch']);

  //     expect(sut.execute).toBeCalledWith(socket, 'aMatch');
  //   });

  //   test('should call execute with command match', () => {
  //     sut.dispatch(socket, ['go aMatch', 'aMatch']);

  //     expect(sut.execute).toBeCalledWith(socket, 'aMatch');
  //   });

  //   test('should clear leader tracking when user moves', () => {
  //     socket.leader = 'test';

  //     sut.dispatch(socket, ['aMatch']);

  //     expect(socket.leader).toBeNull();
  //   });
  // });

  describe('execute', () => {

    beforeAll(() => {

    });

    test('should output message when direction is up and there is no exit', () => {
      mockValidDirectionInput.mockReturnValueOnce(null);

      sut.execute(socket, 'u');

      expect(socket.to(socket.user.roomId).emit).toBeCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the ceiling.</span>` });
      expect(socket.emit).toBeCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    test('should output message when direction is down and there is no exit', () => {
      mockValidDirectionInput.mockReturnValueOnce(null);

      sut.execute(socket, 'd');

      expect(socket.to(socket.user.roomId).emit).toBeCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the floor.</span>` });
      expect(socket.emit).toBeCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    test('should output message when direction is invalid', () => {
      mockValidDirectionInput.mockReturnValueOnce(null);

      sut.execute(socket, 'invalidDir');

      expect(socket.to(socket.user.roomId).emit).not.toBeCalledWith();
      expect(socket.emit).toBeCalledWith('output', { message: '<span class="yellow">That is not a valid direction!</span>' });
    });

    test('should output message when direction is up and there is a closed exit', () => {
      let exitIndex = currentRoom.exits.findIndex(({ dir }) => dir === 'u');
      currentRoom.exits[exitIndex].closed = true;
      sut.execute(socket, 'u');

      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the closed door above.</span>` });
      expect(socket.emit).toBeCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    test('should output message when direction is down and there is a closed exit', () => {
      let exitIndex = currentRoom.exits.findIndex(({ dir }) => dir === 'd');
      currentRoom.exits[exitIndex].closed = true;
      sut.execute(socket, 'd');

      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the trapdoor on the floor.</span>` });
      expect(socket.emit).toBeCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    test('should output message when direction is not up or down and there is a closed exit', () => {
      let exitIndex = currentRoom.exits.findIndex(({ dir }) => dir === 'w');
      currentRoom.exits[exitIndex].closed = true;
      sut.execute(socket, 'w');

      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the door to the west.</span>` });
      expect(socket.emit).toBeCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    xtest('should message correctly movement when direction is up', () => {
      sut.execute(socket, 'u');

      //expect(BreakCommand.execute).toBeCalledWith(socket);

      // enter/exit messages
      expect(socket.broadcast.to(currentRoom.id).emit).toBeCalledWith('output', { message: `${socket.user.username} has gone above.` });
      expect(socket.broadcast.to(uRoom.id).emit).toBeCalledWith('output', { message: `${socket.user.username} has entered from below.` });

      // current/target rooms should not get a movement message
      expect(socket.broadcast.to(uRoom.id).emit).toBeCalledWith('output', { message: 'You hear movement from below.' });
      expect(socket.broadcast.to(currentRoom.id).emit).toBeCalledWith('output', { message: 'You hear movement from below.' });

      expect(socket.emit).toBeCalledWith('output', { message: 'You move up...' });

      // state management
      expect(socket.leave).toBeCalledWith(currentRoom.id);
      expect(socket.join).toBeCalledWith(exit.roomId);
      expect(socket.user.save).toHaveBeenCalled();
      expect(mockLookCommand.execute).toBeCalledWith(socket);
    });


    xtest('should output appropriate messages when direction is down', () => {

      sut.execute(socket, 'd');

      expect(socket.broadcast.to(currentRoom.id).emit).toBeCalledWith('output', { message: `${socket.user.username} has gone below.` });
      expect(socket.broadcast.to(dRoom.id).emit).toBeCalledWith('output', { message: `${socket.user.username} has entered from above.` });
      expect(socket.emit).toBeCalledWith('output', { message: 'You move down...' });
    });

    test('should output appropriate messages when direction is not up or down', () => {

      sut.execute(socket, 'e');

      expect(socket.broadcast.to(currentRoom.id).emit).toBeCalledWith('output', { message: `${socket.user.username} has left to the east.` });
      expect(socket.broadcast.to(eRoom.id).emit).toBeCalledWith('output', { message: `${socket.user.username} has entered from the west.` });
      expect(socket.emit).toBeCalledWith('output', { message: 'You move east...' });
    });
  });

  describe('help', () => {
    test('should print help message', () => {
      sut.help(socket);

      let output = '';
      output += '<span class="cyan">move command </span><span class="darkcyan">-</span> Move in specified direction. Move command word is not used.<br />';
      output += '<span class="mediumOrchid">n<span class="purple"> | </span>north</span> <span class="purple">-</span> Move north.<br />';
      output += '<span class="mediumOrchid">s<span class="purple"> | </span>south</span> <span class="purple">-</span> Move south.<br />';
      output += '<span class="mediumOrchid">e<span class="purple"> | </span>east</span> <span class="purple">-</span> Move east.<br />';
      output += '<span class="mediumOrchid">w<span class="purple"> | </span>west</span> <span class="purple">-</span> Move west.<br />';
      output += '<span class="mediumOrchid">ne<span class="purple"> | </span>northeast</span> <span class="purple">-</span> Move northeast.<br />';
      output += '<span class="mediumOrchid">se<span class="purple"> | </span>southeast</span> <span class="purple">-</span> Move southeast.<br />';
      output += '<span class="mediumOrchid">nw<span class="purple"> | </span>northwest</span> <span class="purple">-</span> Move northwest.<br />';
      output += '<span class="mediumOrchid">sw<span class="purple"> | </span>southwest</span> <span class="purple">-</span> Move southwest.<br />';
      output += '<span class="mediumOrchid">u<span class="purple"> | </span>up</span> <span class="purple">-</span> Move up.<br />';
      output += '<span class="mediumOrchid">d<span class="purple"> | </span>down</span> <span class="purple">-</span> Move down.<br />';

      expect(socket.emit).toBeCalledWith('output', { message: output });
    });
  });
});
