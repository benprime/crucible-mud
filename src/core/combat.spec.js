import Room, { mockGetById, mockValidDirectionInput, mockShortToLong, mockLongToShort, mockRoomCache } from '../models/room';
import { mockSocketInRoom, mockRoomMessage, mockGetSocketByUsername, mockGetSocketByUserId, mockGetFollowingSockets, mockGetRoomSockets, mockValidUserInRoom } from '../core/socketUtil';
import Mob from '../models/mob';
import sut from '../core/combat';
import mocks from '../../spec/mocks';


jest.mock('../models/room');
jest.mock('../core/socketUtil');

describe('combat command', () => {
  beforeAll(() => {
    global.io = new mocks.IOMock();
  });

  describe('processPlayerCombatActions', () => {
    let mockRoom;

    beforeEach(() => {
      mockRoom = mocks.getMockRoom();
      mockGetById.mockReturnValue(mockRoom);
    });

    test('should call room.processPlayerCombatActions for all room Ids', () => {
      global.io.sockets.adapter.rooms = [1, 2];
      const now = Date.now();
      sut.processPlayerCombatActions(now);

      expect(mockRoom.processPlayerCombatActions).toBeCalledWith(now);
      expect(mockRoom.processPlayerCombatActions.mock.calls.length).toEqual(2);
    });

    test('should not call room.processPlayerCombatActions with no room ids', () => {
      global.io.sockets.adapter.rooms = [];

      const now = Date.now();
      sut.processPlayerCombatActions(now);

      expect(mockRoom.processPlayerCombatActions).not.toHaveBeenCalled();
    });
  });

  describe('processMobCombatActions', () => {
    test('should only iterate over rooms that contain a mob', () => {
      let roomWithMobs = mocks.getMockRoom();
      let firstMob = new Mob(mocks.mobType, roomWithMobs.id, 0);
      let secondMob = new Mob(mocks.mobType, roomWithMobs.id, 0);
      roomWithMobs.mobs.push(firstMob);
      roomWithMobs.mobs.push(secondMob);
      let roomWithoutMobs = mocks.getMockRoom();

      Room.roomCache = {};
      Room.roomCache[roomWithMobs.id] = roomWithMobs;
      Room.roomCache[roomWithoutMobs.id] = roomWithoutMobs;

      const now = Date.now();
      sut.processMobCombatActions(now);

      expect(roomWithMobs.processMobCombatActions).toBeCalledWith(now);
      expect(roomWithoutMobs.processMobCombatActions).not.toHaveBeenCalled();
    });

    xdescribe('combatFrame', () => {
      test('should call processPlayerCombatActions and processMobCombatActions', () => {
        jest.spyOn(sut, 'processPlayerCombatActions');
        jest.spyOn(sut, 'processMobCombatActions');

        sut.combatFrame();

        expect(sut.processPlayerCombatActions).toHaveBeenCalled();
        expect(sut.processMobCombatActions).toHaveBeenCalled();
      });
    });
  });
});
