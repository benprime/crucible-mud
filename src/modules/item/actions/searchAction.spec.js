import { mockGetRoomById } from '../../../models/room';
import { mockRoll } from '../../../core/dice';
import mocks from '../../../../spec/mocks';
import sut from './searchAction';

jest.mock('../../../models/room');
jest.mock('../../../core/dice');

let mockRoom;

describe('search', function () {
  let socket;

  beforeEach(function () {
    jest.resetAllMocks();
    socket = new mocks.SocketMock();
    socket.character.skills.search = 0;
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true, hidden: false },
      ],
      inventory: [
        { name: 'ring', hidden: false },
      ],
      save: jasmine.createSpy('roomSave'),
    };
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  test('should reveal all when user is admin', function () {
    socket.character.user.admin = true;
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;
    mockRoll.mockReturnValueOnce(1);


    const result = sut.execute(socket.character);
    expect(result).toBe(true);
    //expect(socket.character.output).toHaveBeenCalledWith('Search Roll: admin<br />You have spotted something!<br />');
    expect(socket.character.output).toHaveBeenCalledWith(expect.stringContaining('You have spotted something!<br />'));
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).toHaveBeenCalled();
  });

  test('should output message when no hidden items exist in room', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = false;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = false;
    mockRoll.mockReturnValueOnce(1);


    const result = sut.execute(socket.character);
    expect(result).toBe(true);
    expect(socket.character.output).toHaveBeenCalledWith('Search Roll: 1<br />You find nothing special.<br />');
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should output message if skill check fails to find anything', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;
    mockRoll.mockReturnValueOnce(3);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6


    const result = sut.execute(socket.character);
    expect(result).toBe(true);
    expect(socket.character.output).toHaveBeenCalledWith('Search Roll: 3<br />You find nothing special.<br />');
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(true);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(true);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should only reveal some items/exits if skill check doesn\'t fully succeed', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;
    mockRoll.mockReturnValueOnce(3);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6


    const result = sut.execute(socket.character);
    expect(result).toBe(true);
    expect(socket.character.output).toHaveBeenCalledWith('Search Roll: 3<br />You find nothing special.<br />');
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(true);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(true);
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should reveal hidden targets and output message when skill fully succeeds seach test', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;
    mockRoll.mockReturnValueOnce(6);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6


    const result = sut.execute(socket.character);
    expect(result).toBe(true);
    expect(socket.character.output).toHaveBeenCalledWith('Search Roll: 6<br />You have spotted something!<br />');
    expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
    expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
    expect(mockRoom.save).toHaveBeenCalled();
  });

});
