import { mockGetById } from '../models/room';
import { mockRoll } from '../core/dice';
import mocks from '../../spec/mocks';
import sut from './sneak';

jest.mock('../models/room');
jest.mock('../core/dice');

let mockRoom;

describe('sneak', function () {
  let socket;

  beforeEach(function () {
    socket = new mocks.SocketMock();
    socket.user.stealth = 0;
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true, hidden: false },
      ],
      inventory: [
        { name: 'ring', hidden: false },
      ],
      save: jasmine.createSpy('roomSave'),
    };
    mockGetById.mockReturnValueOnce(mockRoom);
  });

  test('should reveal all when user is admin', function () {
    socket.user.admin = true;
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;

    sut.execute(socket);

    expect(socket.emit).toBeCalledWith('output', { message: 'Search Roll: admin<br />' });
    expect(socket.emit).toBeCalledWith('output', { message: 'You have spotted something!<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).toHaveBeenCalled();
  });

  test('should output message when no hidden items exist in room', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = false;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = false;

    mockRoll.mockReturnValueOnce(1);

    sut.execute(socket);

    expect(socket.emit).toBeCalledWith('output', { message: 'Search Roll: 1<br />' });
    expect(socket.emit).toBeCalledWith('output', { message: 'You find nothing special.<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should output message if skill check fails to find anything', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;

    mockRoll.mockReturnValueOnce(3);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6

    sut.execute(socket);

    expect(socket.emit).toBeCalledWith('output', { message: 'Search Roll: 3<br />' });
    expect(socket.emit).toBeCalledWith('output', { message: 'You find nothing special.<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(true);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(true);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  xtest('should only reveal some items/exits if skill check doesn\'t fully succed', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;

    diceRoll.and.returnValue(3);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6

    sut.execute(socket);

    expect(socket.emit).toBeCalledWith('output', { message: 'Search Roll: 3<br />' });
    expect(socket.emit).toBeCalledWith('output', { message: 'You find nothing special.<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(true);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(true);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should reveal hidden targets and output message when skill fully succeeds seach test', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;

    mockRoll.mockReturnValueOnce(6);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6

    sut.execute(socket);

    expect(socket.emit).toBeCalledWith('output', { message: 'Search Roll: 6<br />' });
    expect(socket.emit).toBeCalledWith('output', { message: 'You have spotted something!<br />' });
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).toHaveBeenCalled();
  });

});
