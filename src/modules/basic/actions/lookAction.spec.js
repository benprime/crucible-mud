import { mockGetRoomById } from '../../../models/room';
import directions from '../../../core/directions';
import { mockGetSocketByCharacterId, mockRoomMessage } from '../../../core/socketUtil';
import { when } from 'jest-when';
import mocks from '../../../../spec/mocks';
import sut from './lookAction';
import Item from '../../../models/item';
import Room from '../../../models/room';

jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');
jest.mock('../../../core/socketUtil');

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

  describe('execute', () => {

    beforeEach(() => {
      socket.reset();
    });

    describe('on room', () => {

      // current room can't isn't being recognized as a room model...
      xtest('should output short room look when short param is true', () => {
        
        if(currentRoom instanceof Room) {
          console.log('test');
        }

        sut.execute(socket.character, true, currentRoom);

        expect(currentRoom.getDesc).toBeCalledWith(socket.character, true);
      });

      // current room can't isn't being recognized as a room model...
      xtest('should output room look when lookTarget is not passed', () => {
        sut.execute(socket.character, false, currentRoom);
        expect(currentRoom.getDesc).toBeCalledWith(socket.character, false);
      });

      test('should output room look when lookTarget is a direction', () => {
        // act
        sut.execute(socket.character, false, directions.S);

        // assert
        expect(socket.character.output).toHaveBeenCalledWith('You look to the south...\nmocked room description');
        expect(mockRoomMessage).toHaveBeenCalledWith(targetRoomSouth.id, `<span class="yellow">${socket.character.name} peaks in from the north.</span>`, [socket.character.id]);
        //expect(socket.character.toRoom).toHaveBeenCalledWith(`${socket.character.name} looks to the south.\n`, [socket.character.id]);
        expect(targetRoomSouth.getDesc).toBeCalledWith(socket.character, false);
      });

      test('should output a message when lookTarget is a direction with a closed door', () => {
        // act
        sut.execute(socket.character, false, directions.N);

        // assert
        expect(socket.character.output).toHaveBeenCalledWith('The door in that direction is closed!');
      });
    });

    // TODO: this could really use some more tests
    describe('on item', () => {

      test('should do nothing when lookTarget is an invalid inventory item', () => {
        sut.execute(socket.character, false, null);

        expect(socket.character.output).toHaveBeenCalledWith('You don\'t see that here.');
      });

    });

    describe('on mob', () => {

      test('should output description of mob', () => {
        const item = new Item({ desc: 'a practice dummy' });
        mockGetSocketByCharacterId.mockReturnValue(socket);

        sut.execute(socket.character, false, item);

        expect(socket.character.output).toHaveBeenCalledWith('a practice dummy');
      });
    });

  });

});
