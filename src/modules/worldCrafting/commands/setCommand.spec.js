import { mockGetRoomById } from '../../../models/room';
import mocks from '../../../../spec/mocks';
import sut from './setCommand';

jest.mock('../../../models/room');

let mockRoom = mocks.getMockRoom();
mockGetRoomById.mockReturnValue(mockRoom);


describe('set command', () => {

  describe('parseParams', () => {
    test('returns appropriate fields', () => {
      const match = [
        'whole string here',
        'room',
        'name',
        'new name value',
      ];
      const result = sut.parseParams(match);
      expect(result).toEqual({
        'actionName': 'set',
        'actionParams': ['room', 'name', 'new name value'],
      });

    });
  });
});
