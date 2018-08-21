import { mockGetRoomById, mockValidDirectionInput, mockShortToLong, mockOppositeDirection, mockRoomCache } from '../models/room';
import {mockGetSocketByCharacterId, mockGetFollowingCharacters} from '../core/socketUtil';
import mocks from '../../spec/mocks';
import { when } from 'jest-when';
import { mockLookCommand } from './look';
import sut from './move';

jest.mock('../models/room');
jest.mock('./break');
jest.mock('./look');
jest.mock('../core/socketUtil');

global.io = new mocks.IOMock();


// TODO: these tests need to be seperated out into tests for the character.move method
xdescribe('move', () => {
  let socket;
  let currentRoom;

  let uRoom;
  let dRoom;
  let nRoom;
  let sRoom;
  let eRoom;
  let wRoom;

  beforeEach(() => {
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
    currentRoom = mocks.getMockRoom(socket.character.roomId);
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

    when(mockGetRoomById).calledWith(currentRoom.id).mockReturnValue(currentRoom);
    when(mockGetRoomById).calledWith(uRoom.id).mockReturnValue(uRoom);
    when(mockGetRoomById).calledWith(dRoom.id).mockReturnValue(dRoom);
    when(mockGetRoomById).calledWith(nRoom.id).mockReturnValue(nRoom);
    when(mockGetRoomById).calledWith(sRoom.id).mockReturnValue(sRoom);
    when(mockGetRoomById).calledWith(eRoom.id).mockReturnValue(eRoom);
    when(mockGetRoomById).calledWith(wRoom.id).mockReturnValue(wRoom);

    mockRoomCache[uRoom.id] = uRoom;
    mockRoomCache[dRoom.id] = dRoom;
    mockRoomCache[nRoom.id] = nRoom;
    mockRoomCache[sRoom.id] = sRoom;
    mockRoomCache[eRoom.id] = eRoom;
    mockRoomCache[wRoom.id] = wRoom;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    socket.character.roomId = currentRoom.id;
    global.io.reset();

    // working around the closed-door tests
    // for(let i in mockRoomCache) {
    //   mockRoomCache[i].exits.forEach(e => e.closed = false);
    // }
  });

  describe('dispatch', () => {
    beforeEach(() => {
      jest.spyOn(sut, 'execute');
      //global.io.reset();
    });

    afterEach(() => {
      sut.execute.mockClear();
    });

    test('should call execute with direction match', () => {
      sut.dispatch(socket, ['aMatch']);

      expect(sut.execute).toBeCalledWith(socket.character, 'aMatch');
    });

    test('should call execute with command match', () => {
      sut.dispatch(socket, ['go aMatch', 'aMatch']);

      expect(sut.execute).toBeCalledWith(socket.character, 'aMatch');
    });

    test('should clear leader tracking when user moves', () => {
      socket.leader = 'test';

      sut.dispatch(socket, ['aMatch']);

      expect(socket.character.leader).toBeNull();
    });
  });

  describe('execute', () => {

    beforeAll(() => {

    });

    test('should output message when direction is up and there is no exit', () => {
      mockValidDirectionInput.mockReturnValueOnce(null);

      return sut.execute(socket.character, 'u').then(response => {
        expect(socket.to(socket.character.roomId).emit).toBeCalledWith('output', { message: `<span class="silver">${socket.character.name} runs into the ceiling.</span>` });
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: '<span class="yellow">There is no exit in that direction!</span>' });
      });


    });

    test('should output message when direction is down and there is no exit', () => {
      mockValidDirectionInput.mockReturnValueOnce(null);

      return sut.execute(socket.character, 'd').then(response => {
        expect(socket.to(socket.character.roomId).emit).toBeCalledWith('output', { message: `<span class="silver">${socket.character.name} runs into the floor.</span>` });
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: '<span class="yellow">There is no exit in that direction!</span>' });
      });

    });

    test('should output message when direction is invalid', () => {
      mockValidDirectionInput.mockReturnValueOnce(null);

      return sut.execute(socket.character, 'invalidDir').then(response => {
        expect(socket.to(socket.character.roomId).emit).not.toBeCalledWith();
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: '<span class="yellow">That is not a valid direction!</span>' });
      });


    });

    test('should output message when direction is up and there is a closed exit', () => {
      let exitIndex = currentRoom.exits.findIndex(({ dir }) => dir === 'u');
      currentRoom.exits[exitIndex].closed = true;
      return sut.execute(socket.character, 'u').then(response => {
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `<span class="silver">${socket.character.name} runs into the closed door above.</span>` });
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: '<span class="yellow">The door in that direction is not open!</span>' });
      });

    });

    test('should output message when direction is down and there is a closed exit', () => {
      let exitIndex = currentRoom.exits.findIndex(({ dir }) => dir === 'd');
      currentRoom.exits[exitIndex].closed = true;
      return sut.execute(socket.character, 'd').then(response => {
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `<span class="silver">${socket.character.name} runs into the trapdoor on the floor.</span>` });
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: '<span class="yellow">The door in that direction is not open!</span>' });
      });

    });

    xtest('should output message when direction is not up or down and there is a closed exit', () => {
      let exitIndex = currentRoom.exits.findIndex(({ dir }) => dir === 'w');
      currentRoom.exits[exitIndex].closed = true;
      return sut.execute(socket.character, 'w').then(response => {
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `<span class="silver">${socket.character.name} runs into the door to the west.</span>` });
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: '<span class="yellow">The door in that direction is not open!</span>' });
      });

    });

    xtest('should message correctly movement when direction is up', () => {
      return sut.execute(socket.character, 'u').then(response => {
      });

      //expect(BreakCommand.execute).toBeCalledWith(socket);

      // enter/exit messages
      expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `${socket.character.name} has gone above.` });
      expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `${socket.character.name} has entered from below.` });

      // current/target rooms should not get a movement message
      expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'You hear movement from below.' });
      expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: 'You hear movement from above.' });

      expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'You move up...' });

      // state management
      expect(socket.leave).toBeCalledWith(currentRoom.id);
      expect(socket.join).toBeCalledWith(uRoom.id);
      expect(socket.character.save).toHaveBeenCalled();
      expect(mockLookCommand).toBeCalledWith(socket);
    });


    xtest('should output appropriate messages when direction is down', () => {

      return sut.execute(socket.character, 'd').then(response => {
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `${socket.character.name} has gone below.` });
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `${socket.character.name} has entered from above.` });
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'You move down...' });
      });

    });

    xtest('should output appropriate messages when direction is not up or down', () => {

      mockGetSocketByCharacterId.mockReturnValueOnce(socket);
      currentRoom.IsExitPassable.mockReturnValueOnce(Promise.resolve(currentRoom.exits.find(e => e.dir === 'e')));
      mockGetFollowingCharacters.mockReturnValue([]);

      return sut.execute(socket.character, 'e').then(response => {
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `${socket.character.name} has left to the east.` });
        expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `${socket.character.name} has entered from the west.` });
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'You move east...' });
      });

    });
  });

  describe('help', () => {
    test('should print help message', () => {
      const response = sut.help(socket);

      let expected = '';
      expected += '<span class="cyan">move command </span><span class="darkcyan">-</span> Move in specified direction. Move command word is not used.<br />';
      expected += '<span class="mediumOrchid">n<span class="purple"> | </span>north</span> <span class="purple">-</span> Move north.<br />';
      expected += '<span class="mediumOrchid">s<span class="purple"> | </span>south</span> <span class="purple">-</span> Move south.<br />';
      expected += '<span class="mediumOrchid">e<span class="purple"> | </span>east</span> <span class="purple">-</span> Move east.<br />';
      expected += '<span class="mediumOrchid">w<span class="purple"> | </span>west</span> <span class="purple">-</span> Move west.<br />';
      expected += '<span class="mediumOrchid">ne<span class="purple"> | </span>northeast</span> <span class="purple">-</span> Move northeast.<br />';
      expected += '<span class="mediumOrchid">se<span class="purple"> | </span>southeast</span> <span class="purple">-</span> Move southeast.<br />';
      expected += '<span class="mediumOrchid">nw<span class="purple"> | </span>northwest</span> <span class="purple">-</span> Move northwest.<br />';
      expected += '<span class="mediumOrchid">sw<span class="purple"> | </span>southwest</span> <span class="purple">-</span> Move southwest.<br />';
      expected += '<span class="mediumOrchid">u<span class="purple"> | </span>up</span> <span class="purple">-</span> Move up.<br />';
      expected += '<span class="mediumOrchid">d<span class="purple"> | </span>down</span> <span class="purple">-</span> Move down.<br />';

      expect(socket.emit).toHaveBeenCalled();
    });
  });
});
