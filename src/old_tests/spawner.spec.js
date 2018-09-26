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
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'add', 'kobold').then(() => {
          // assert
          expect(currentRoom.save).toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Creature added to spawner.');
          expect(currentRoom.spawner.mobTypes.length).toBeGreaterThan(beforeLength);
        });

      });

      test('should output error message when mob type is invalid', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;
        expect.assertions(4);

        // act
        return sut.execute(socket.character, 'add', 'unknown mob type').catch(() => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(socket.emit).not.toBeCalledWith('output', { message: 'Creature added to spawner.' });
          expect(socket.character.output).toHaveBeenCalledWith('Invalid mobType.');
          expect(currentRoom.spawner.mobTypes).toHaveLength(beforeLength);
        });


      });
    });

    describe('when action is remove', () => {
      test('should remove existing mob type', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'remove', 'kobold').then(() => {
          // assert
          expect(currentRoom.save).toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Creature removed from spawner.');
          expect(currentRoom.spawner.mobTypes.length).toBeLessThan(beforeLength);
        });


      });

      test('should output error message when mob type is invalid', () => {
        // arrange
        const beforeLength = currentRoom.spawner.mobTypes.length;
        expect.assertions(4);

        // act
        return sut.execute(socket.character, 'add', 'unknown mob type').catch(() => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(socket.emit).not.toBeCalledWith('output', { message: 'Creature added to spawner.' });
          expect(socket.character.output).toHaveBeenCalledWith('Invalid mobType.');
          expect(currentRoom.spawner.mobTypes).toHaveLength(beforeLength);
        });


      });

      test('should output error when mob type does not exist on spawner', () => {
        expect.assertions(2);
        // act
        return sut.execute(socket.character, 'remove', 'enchanted sparring dummy').catch(() => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Creature not found on spawner.');
        });


      });
    });


    describe('when action is max', () => {
      test('should output error message when param value is not an integer', () => {
        // arrange
        currentRoom.spawner.max = 2;
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'max', 'not an int').catch(() => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Invalid max value - must be an integer.');
          expect(currentRoom.spawner.max).toEqual(2);
        });


      });

      test('should set max when value is valid', () => {
        // arrange
        currentRoom.spawner.max = 2;
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'max', 7).then(() => {
          // assert
          expect(currentRoom.save).toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Max creatures updated to 7.');
          expect(currentRoom.spawner.max).toEqual(7);
        });


      });
    });

    describe('when action is timeout', () => {
      test('when set timeout when value is valid', () => {
        // arrange
        currentRoom.spawner.timeout = 1;
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'timeout', 5).then(() => {
          // assert
          expect(currentRoom.save).toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Timeout updated to 5.');
          expect(currentRoom.spawner.timeout).toEqual(5);
        });


      });

      test('should output error message when param value is not an integer', () => {
        // arrange
        currentRoom.spawner.max = 2;
        expect.assertions(3);

        // act
        return sut.execute(socket.character, 'timeout', 'not an int').catch(() => {
          // assert
          expect(currentRoom.save).not.toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Invalid max value - must be an integer.');
          expect(currentRoom.spawner.max).toEqual(2);
        });


      });
    });

    describe('when action is clear', () => {
      test('when action is clear', () => {
        expect.assertions(3);
        // act
        return sut.execute(socket.character, 'clear').then(() => {
          // arrange
          expect(currentRoom.save).toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Spawner cleared.');
          expect(currentRoom.spawner).toBeNull();
        });


      });
    });

    describe('when action is copy', () => {
      test('when action is copy', () => {
        expect.assertions(2);
        // act
        return sut.execute(socket.character, 'copy').then(() => {
          // assert
          expect(socket.character.output).toHaveBeenCalledWith('Spawner copied.');
          expect(socket.character.spawnerClipboard).toEqual(currentRoom.spawner);
        });


      });
    });

    describe('when action is paste', () => {
      test('when action is paste', () => {
        // arrange
        socket.character.spawnerClipboard = null;
        expect.assertions(2);

        // act
        return sut.execute(socket.character, 'paste').then(() => {
          // assert
          expect(socket.character.output).toHaveBeenCalledWith('Spawner pasted.');
          expect(currentRoom.spawner).toBeNull();
        });


      });
    });

    test('when action is not valid', () => {
      expect.assertions(1);
      // act
      return sut.execute(socket.character, 'multiply').then(() => {
        // assert
        expect(socket.character.output).toHaveBeenCalledWith(currentRoom.spawner ? currentRoom.spawner.toString() : 'None.');
      });

    });
  });
});
