import { mockGetById, mockValidDirectionInput, mockShortToLong, mockLongToShort } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './attack';

jest.mock('../models/room');
jest.mock('../core/autocomplete');

describe('attack', () => {
  let socket;
  let mockRoom;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    mockRoom = mocks.getMockRoom();
  });

  beforeEach(() => {
    socket.reset();
  });

  // TODO: Dispatch always triggers execute.
  // perhaps create a base class that calls execute and have a seperate
  // method for parsing the params. Dispatch exists to parse params, and
  // so it would make sense that that is all the test coverage it would need.
  // describe('dispatch triggers execute', () => {
  //   let executeSpy;

  //   beforeAll(() => {
  //     executeSpy = spyOn(sut, 'execute');
  //   });

  //   test('on short pattern', () => {
  //     let mockAutocompleteTypes.mockReturnValueOnce('thing');
  //     mockAutocompleteTypes.mockReturnValueOnce(autocompleteResult);
  //     sut.dispatch(socket, ['a th', 'thing']);

  //     expect(executeSpy).toBeCalledWith(socket, autocompleteResult);
  //   });
  // });

  describe('execute', () => {
    beforeEach(() => {
      socket = new mocks.SocketMock();
      socket.user.username = 'aName';
      socket.user.roomId = mockRoom.id;
    });

    test('should set state and emit output when valid target found', () => {
      const autocompleteResult = {
        item: {
          id: 123,
          displayName: 'a thing!',
        },
        type: 'mob',
      };
      mockGetById.mockReturnValueOnce(mockRoom);
      mockAutocompleteTypes.mockReturnValueOnce(autocompleteResult);

      sut.execute(socket, 'thing');

      expect(socket.emit).toBeCalledWith('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: `${socket.user.username} moves to attack ${autocompleteResult.displayName}!` });
      expect(socket.user.attackTarget).toBe(autocompleteResult.item.id);
    });

    test('should set state and emit output when no target found', () => {
      mockGetById.mockReturnValueOnce(mockRoom);
      mockAutocompleteTypes.mockReturnValueOnce(null);

      sut.execute(socket, 'thing');

      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.user.attackTarget).toBeFalsy();
    });
  });
});
