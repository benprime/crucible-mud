import { mockGetRoomById } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './spawner';


jest.mock('../models/room');

import SpawnerModel from '../models/spawner';

describe('spawner', () => {
  let socket;
  let currentRoom;

  beforeEach(() => {
    currentRoom = mocks.getMockRoom();
    currentRoom.name = 'Dance Floor';
    currentRoom.spawner = new SpawnerModel();
    currentRoom.spawner.mobTypes.push(mocks.mobType.name);
    mockGetRoomById.mockReturnValue(currentRoom);

    socket = new mocks.SocketMock();
    socket.character.roomId = currentRoom.id;
    socket.user.username = 'Disco Jim';
  });

  describe('execute', () => {

    describe('when action is add', () => {
      test('should successfully add valid mob type', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;

        // act
        sut.execute(socket, 'add', 'kobold');

        // assert
        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Creature added to spawner.' });
        expect(currentRoom.spawner.mobTypes.length).toBeGreaterThan(beforeLength);
      });

      test('should output error message when mob type is invalid', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;

        // act
        sut.execute(socket, 'add', 'unknown mob type');

        // assert
        expect(currentRoom.save).not.toHaveBeenCalled();
        expect(socket.emit).not.toBeCalledWith('output', { message: 'Creature added to spawner.' });
        expect(socket.emit).toBeCalledWith('output', { message: 'Invalid mobType.' });
        expect(currentRoom.spawner.mobTypes).toHaveLength(beforeLength);
      });
    });

    describe('when action is remove', () => {
      test('should remove existing mob type', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;

        // act
        sut.execute(socket, 'remove', 'kobold');

        // assert
        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Creature removed from spawner.' });
        expect(currentRoom.spawner.mobTypes.length).toBeLessThan(beforeLength);
      });

      test('should output error message when mob type is invalid', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;

        // act
        sut.execute(socket, 'add', 'unknown mob type');

        // assert
        expect(currentRoom.save).not.toHaveBeenCalled();
        expect(socket.emit).not.toBeCalledWith('output', { message: 'Creature added to spawner.' });
        expect(socket.emit).toBeCalledWith('output', { message: 'Invalid mobType.' });
        expect(currentRoom.spawner.mobTypes).toHaveLength(beforeLength);
      });

      test('should output error when mob type does not exist on spawner', () => {
        // act
        sut.execute(socket, 'remove', 'dummy');

        // assert
        expect(currentRoom.save).not.toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Creature not found on spawner.' });
      });
    });


    describe('when action is max', () => {
      test('should output error message when param value is not an integer', () => {
        // arrange
        currentRoom.spawner.max = 2;

        // act
        sut.execute(socket, 'max', 'not an int');

        // assert
        expect(currentRoom.save).not.toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Invalid max value - must be an integer.' });
        expect(currentRoom.spawner.max).toEqual(2);
      });

      test('should set max when value is valid', () => {
        // arrange
        currentRoom.spawner.max = 2;

        // act
        sut.execute(socket, 'max', 7);

        // assert
        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Max creatures updated to 7.' });
        expect(currentRoom.spawner.max).toEqual(7);
      });
    });

    describe('when action is timeout', () => {
      test('when set timeout when value is valid', () => {
        // arrange
        currentRoom.spawner.timeout = 1;

        // act
        sut.execute(socket, 'timeout', 5);

        // assert
        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Timeout updated to 5.' });
        expect(currentRoom.spawner.timeout).toEqual(5);
      });

      test('should output error message when param value is not an integer', () => {
        // arrange
        currentRoom.spawner.max = 2;

        // act
        sut.execute(socket, 'timeout', 'not an int');

        // assert
        expect(currentRoom.save).not.toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Invalid max value - must be an integer.' });
        expect(currentRoom.spawner.max).toEqual(2);
      });
    });

    describe('when action is clear', () => {
      test('when action is clear', () => {
        // act
        sut.execute(socket, 'clear');

        // arrange
        expect(currentRoom.save).toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Spawner cleared.' });
        expect(currentRoom.spawner).toBeNull();
      });
    });

    describe('when action is copy', () => {
      test('when action is copy', () => {
        // act
        sut.execute(socket, 'copy');

        // assert
        expect(socket.emit).toBeCalledWith('output', { message: 'Spawner copied.' });
        expect(socket.character.spawnerClipboard).toEqual(currentRoom.spawner);
      });
    });

    describe('when action is paste', () => {
      test('when action is paste', () => {
        // arrange
        socket.character.spawnerClipboard = null;

        // act
        sut.execute(socket, 'paste');

        // assert
        expect(socket.emit).toBeCalledWith('output', { message: 'Spawner pasted.' });
        expect(currentRoom.spawner).toBeNull();
      });
    });

    test('when action is not valid', () => {
      // act
      sut.execute(socket, 'multiply');

      // assert
      expect(socket.emit).toBeCalledWith('output', { message: (currentRoom.spawner ? currentRoom.spawner.toString() : 'None.') });
    });
  });
});
