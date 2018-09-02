import { mockGetRoomById, mockValidDirectionInput, mockShortToLong, mockOppositeDirection } from '../models/room';
import { mockAutocompleteMultiple } from '../core/autocomplete';
import { mockGetSocketByCharacterId, mockRoomMessage } from '../core/socketUtil';
import { when } from 'jest-when';
import mocks from '../../spec/mocks';
import sut from './look';
import Item from '../models/item';

jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

describe('look', () => {
  let socket;
  let currentRoom;
  let targetRoomNorth;
  let targetRoomSouth;

  beforeEach(() => {
    global.io = new mocks.IOMock();
    socket = new mocks.SocketMock();
    targetRoomNorth = mocks.getMockRoom();
    currentRoom = mocks.getMockRoom(socket.character.roomId);
    currentRoom.mobs = [{ name: 'dummy', desc: 'a dummy!' }];
    const nExit = currentRoom.exits.find(e => e.dir === 'n');
    nExit.roomId = targetRoomNorth.id;
    nExit.closed = true;

    targetRoomSouth = mocks.getMockRoom();
    const sExit = currentRoom.exits.find(e => e.dir === 's');
    sExit.roomId = targetRoomSouth.id;
    sExit.closed = false;

    when(mockGetRoomById).calledWith(currentRoom.id).mockReturnValue(currentRoom);
    when(mockGetRoomById).calledWith(targetRoomNorth.id).mockReturnValue(targetRoomNorth);
    when(mockGetRoomById).calledWith(targetRoomSouth.id).mockReturnValue(targetRoomSouth);
  });

  describe('dispatch triggers execute', () => {
    let executeSpy;

    beforeAll(() => {
      executeSpy = jest.spyOn(sut, 'execute');
    });

    test('on short pattern', () => {
      sut.dispatch(socket, ['']);

      expect(executeSpy).toBeCalledWith(socket.character, true, null);
    });

    test('on long pattern', () => {
      let lookTarget = 'look_target';
      sut.dispatch(socket, ['l', lookTarget]);

      expect(executeSpy).toBeCalledWith(socket.character, false, lookTarget);
    });

    afterAll(() => {
      sut.execute.mockRestore();
    });
  });

  describe('execute', () => {

    beforeEach(() => {
      socket.reset();
    });

    describe('on room', () => {

      test('should output short room look when short param is true', () => {
        expect.assertions(1);

        return sut.execute(socket.character, true).then(() => {
          expect(currentRoom.getDesc).toBeCalledWith(socket.character, true);
        });

      });

      test('should output room look when lookTarget is not passed', () => {
        expect.assertions(1);

        return sut.execute(socket.character, false).then(() => {
          expect(currentRoom.getDesc).toBeCalledWith(socket.character, false);
        });

      });

      test('should output room look when lookTarget is a direction', () => {
        // arrange
        mockValidDirectionInput.mockReturnValue('s');
        mockShortToLong.mockReturnValueOnce('south').mockReturnValueOnce('north');
        expect.assertions(3);

        // act
        return sut.execute(socket.character, false, 's').then(() => {

          // assert
          expect(socket.character.output).toHaveBeenCalledWith('You look to the south...\nmocked room description');
          expect(mockRoomMessage).toHaveBeenCalledWith(targetRoomSouth.id, `<span class="yellow">${socket.character.name} peaks in from the north.</span>`, [socket.character.id]);
          //expect(socket.character.toRoom).toHaveBeenCalledWith(`${socket.character.name} looks to the south.\n`, [socket.character.id]);
          expect(targetRoomSouth.getDesc).toBeCalledWith(socket.character, false);
        });
      });

      test('should output a message when lookTarget is a direction with a closed door', () => {
        // arrange
        mockValidDirectionInput.mockReturnValue('n');
        mockOppositeDirection.mockReturnValue('s');
        mockShortToLong.mockReturnValue('south');
        expect.assertions(1);

        // act
        return sut.execute(socket.character, false, 'n').catch(() => {
          // assert
          expect(socket.character.output).toHaveBeenCalledWith('The door in that direction is closed!');
        });

      });
    });

    // TODO: this could really use some more tests
    describe('on item', () => {

      test('should do nothing when lookTarget is an invalid inventory item', () => {
        mockValidDirectionInput.mockReturnValue(null);
        mockAutocompleteMultiple.mockReturnValue(undefined);
        expect.assertions(1);

        return sut.execute(socket.character, false, 'boot').catch(() => {
          expect(socket.character.output).toHaveBeenCalledWith('You don\'t see that here.');
        });

      });

    });

    describe('on mob', () => {

      test('should output description of mob', () => {
        mockAutocompleteMultiple.mockReturnValue({ item: new Item({ desc: 'a practice dummy' }) });
        mockValidDirectionInput.mockReturnValue(false);
        mockGetSocketByCharacterId.mockReturnValue(socket);
        expect.assertions(1);

        return sut.execute(socket.character, false, 'dummy').then(() => {
          expect(socket.character.output).toHaveBeenCalledWith('a practice dummy');
        });

      });
    });

  });

  test('help should output message', () => {
    sut.help(socket.character);

    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';

    expect(socket.character.output).toHaveBeenCalledWith(output);
  });
});
