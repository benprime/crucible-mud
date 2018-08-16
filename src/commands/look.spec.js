import { mockGetRoomById, mockValidDirectionInput, mockShortToLong, mockOppositeDirection } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import { when } from 'jest-when';
import mocks from '../../spec/mocks';
import sut from './look';

//jest.mock('../models/user');
jest.mock('../models/room');
jest.mock('../core/autocomplete');

describe('look', () => {
  let socket;
  let currentRoom;
  let targetRoomNorth;
  let targetRoomSouth;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    // socket.user.roomId = 'currentRoomId0000000000';
    targetRoomNorth = mocks.getMockRoom();
    currentRoom = mocks.getMockRoom(socket.user.roomId);
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

      expect(executeSpy).toBeCalledWith(socket, true, null);
    });

    test('on long pattern', () => {
      let lookTarget = 'look_target';
      sut.dispatch(socket, ['l', lookTarget]);

      expect(executeSpy).toBeCalledWith(socket, false, lookTarget);
    });
  });

  describe('execute', () => {
    test('should output short room look when short param is true', () => {
      sut.execute(socket, true);

      expect(currentRoom.look).toBeCalledWith(socket, true);
    });

    test('should output room look when lookTarget is not passed', () => {
      sut.execute(socket, false);

      expect(currentRoom.look).toBeCalledWith(socket, false);
    });

    test('should output room look when lookTarget is a direction', () => {
      // arrange
      mockValidDirectionInput.mockReturnValue('s');
      mockShortToLong.mockReturnValueOnce('south').mockReturnValueOnce('north');

      // act
      sut.execute(socket, false, 's');

      // assert
      expect(socket.emit).toBeCalledWith('output', { message: 'You look to the south...' });
      expect(socket.broadcast.to(targetRoomSouth.id).emit).toBeCalledWith('output', { message: `<span class="yellow">${socket.user.username} peaks in from the north.</span>` });
      expect(targetRoomSouth.look).toBeCalledWith(socket, false);
    });

    test('should output a message when lookTarget is a direction with a closed door', () => {
      // arrange
      mockValidDirectionInput.mockReturnValue('n');
      mockOppositeDirection.mockReturnValue('s');
      mockShortToLong.mockReturnValue('south');

      // act
      sut.execute(socket, false, 'n');

      // assert
      expect(socket.emit).toBeCalledWith('output', { message: 'The door in that direction is closed!' });
    });

    test('should do nothing when lookTarget is an invalid inventory item', () => {
      mockValidDirectionInput.mockReturnValue(null);
      mockAutocompleteTypes.mockReturnValue(undefined);

      sut.execute(socket, false, 'boot');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown item!' });
    });

  });

  test('help should output message', () => {
    sut.help(socket);

    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';

    expect(socket.emit).toBeCalledWith('output', { message: output });
  });
});
