import { mockGetRoomById } from '../models/room';
import { mockRoll } from '../core/dice';
import mocks from '../../spec/mocks';
import sut from './search';

jest.mock('../models/room');
jest.mock('../core/dice');

let mockRoom;

describe('search', function () {
  let socket;

  beforeEach(function () {
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
    mockGetRoomById.mockReturnValueOnce(mockRoom);
    mockRoll.mockReset();
  });

  test('should reveal all when user is admin', function () {
    socket.character.user.admin = true;
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;
    mockRoll.mockReturnValueOnce(1);
    expect.assertions(4);

    return sut.execute(socket.character).then(response => {
      //expect(response).toEqual('Search Roll: admin<br />You have spotted something!<br />');
      expect(response).toEqual('You have spotted something!<br />');
      expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
      expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
      expect(mockRoom.save).toHaveBeenCalled();
    });
  });

  test('should output message when no hidden items exist in room', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = false;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = false;
    mockRoll.mockReturnValueOnce(1);
    expect.assertions(4);

    return sut.execute(socket.character).then(response => {
      expect(response).toEqual('Search Roll: 1<br />You find nothing special.<br />');
      expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
      expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
      expect(mockRoom.save).not.toHaveBeenCalled();
    });


  });

  test('should output message if skill check fails to find anything', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;
    mockRoll.mockReturnValueOnce(3);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6
    expect.assertions(4);

    return sut.execute(socket.character).then(response => {
      expect(response).toEqual('Search Roll: 3<br />You find nothing special.<br />');
      expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(true);
      expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(true);
      expect(mockRoom.save).not.toHaveBeenCalled();
    });


  });

  test('should only reveal some items/exits if skill check doesn\'t fully succeed', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;
    mockRoll.mockReturnValueOnce(3);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6
    expect.assertions(4);

    return sut.execute(socket.character).then(response => {
      expect(response).toEqual('Search Roll: 3<br />You find nothing special.<br />');
      expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(true);
      expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(true);
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

  });

  test('should reveal hidden targets and output message when skill fully succeeds seach test', function () {
    mockRoom.exits.find(e => e.dir === 'n').hidden = true;
    mockRoom.inventory.find(i => i.name === 'ring').hidden = true;
    mockRoll.mockReturnValueOnce(6);  //default room DC was (4 + numHidden) to find everything, so mockroom DC is 6
    expect.assertions(4);

    return sut.execute(socket.character).then(response => {
      expect(response).toEqual('Search Roll: 6<br />You have spotted something!<br />');
      expect(mockRoom.exits.find(e => e.dir === 'n').hidden).toEqual(false);
      expect(mockRoom.inventory.find(i => i.name === 'ring').hidden).toEqual(false);
      expect(mockRoom.save).toHaveBeenCalled();
    });

  });

});
