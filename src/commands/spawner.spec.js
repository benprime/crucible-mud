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
    socket.character.name = 'Disco Jim';
  });

  describe('execute', () => {

    describe('when action is add', () => {
      test('should successfully add valid mob type', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;

        // act
        return sut.execute(socket.character, 'add', 'kobold').then(response => {
          // assert
          expect(currentRoom.save).toHaveBeenCalled();
          expect(response).toBe('Creature added to spawner.');
          expect(currentRoom.spawner.mobTypes.length).toBeGreaterThan(beforeLength);
        });

      });

      test('should output error message when mob type is invalid', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;

        // act
        return sut.execute(socket.character, 'add', 'unknown mob type').catch(response => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(socket.emit).not.toBeCalledWith('output', { message: 'Creature added to spawner.' });
          expect(response).toBe('Invalid mobType.');
          expect(currentRoom.spawner.mobTypes).toHaveLength(beforeLength);
        });


      });
    });

    describe('when action is remove', () => {
      test('should remove existing mob type', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;

        // act
        return sut.execute(socket.character, 'remove', 'kobold').then(response => {
          // assert
          expect(currentRoom.save).toHaveBeenCalled();
          expect(response).toBe('Creature removed from spawner.');
          expect(currentRoom.spawner.mobTypes.length).toBeLessThan(beforeLength);
        });


      });

      test('should output error message when mob type is invalid', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;

        // act
        return sut.execute(socket.character, 'add', 'unknown mob type').catch(response => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(socket.emit).not.toBeCalledWith('output', { message: 'Creature added to spawner.' });
          expect(response).toBe('Invalid mobType.');
          expect(currentRoom.spawner.mobTypes).toHaveLength(beforeLength);
        });


      });

      test('should output error when mob type does not exist on spawner', () => {
        // act
        return sut.execute(socket.character, 'remove', 'dummy').catch(response => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(response).toBe('Creature not found on spawner.');
        });


      });
    });


    describe('when action is max', () => {
      test('should output error message when param value is not an integer', () => {
        // arrange
        currentRoom.spawner.max = 2;

        // act
        return sut.execute(socket.character, 'max', 'not an int').catch(response => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(response).toBe('Invalid max value - must be an integer.');
          expect(currentRoom.spawner.max).toEqual(2);
        });


      });

      test('should set max when value is valid', () => {
        // arrange
        currentRoom.spawner.max = 2;

        // act
        return sut.execute(socket.character, 'max', 7).then(response => {
          // assert
          expect(currentRoom.save).toHaveBeenCalled();
          expect(response).toBe('Max creatures updated to 7.');
          expect(currentRoom.spawner.max).toEqual(7);
        });


      });
    });

    describe('when action is timeout', () => {
      test('when set timeout when value is valid', () => {
        // arrange
        currentRoom.spawner.timeout = 1;

        // act
        return sut.execute(socket.character, 'timeout', 5).then(response => {
          // assert
          expect(currentRoom.save).toHaveBeenCalled();
          expect(response).toBe('Timeout updated to 5.');
          expect(currentRoom.spawner.timeout).toEqual(5);
        });


      });

      test('should output error message when param value is not an integer', () => {
        // arrange
        currentRoom.spawner.max = 2;

        // act
        return sut.execute(socket.character, 'timeout', 'not an int').catch(response => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(response).toBe('Invalid max value - must be an integer.');
          expect(currentRoom.spawner.max).toEqual(2);
        });


      });
    });

    describe('when action is clear', () => {
      test('when action is clear', () => {
        // act
        return sut.execute(socket.character, 'clear').then(response => {
          // arrange
          expect(currentRoom.save).toHaveBeenCalled();
          expect(response).toBe('Spawner cleared.');
          expect(currentRoom.spawner).toBeNull();
        });


      });
    });

    describe('when action is copy', () => {
      test('when action is copy', () => {
        // act
        return sut.execute(socket.character, 'copy').then(response => {
          // assert
          expect(response).toBe('Spawner copied.');
          expect(socket.character.spawnerClipboard).toEqual(currentRoom.spawner);
        });


      });
    });

    describe('when action is paste', () => {
      test('when action is paste', () => {
        // arrange
        socket.character.spawnerClipboard = null;

        // act
        return sut.execute(socket.character, 'paste').then(response => {
          // assert
          expect(response).toBe('Spawner pasted.');
          expect(currentRoom.spawner).toBeNull();
        });


      });
    });

    test('when action is not valid', () => {
      // act
      return sut.execute(socket.character, 'multiply').catch(response => {
        // assert
        expect(response).toEqual(currentRoom.spawner ? currentRoom.spawner.toString() : 'None.');
      });

    });
  });
});
