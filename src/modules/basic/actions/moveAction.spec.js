import directions from '../../../core/directions';
import mocks from '../../../../spec/mocks';
import sut from './moveAction';

jest.mock('../../../models/room');
jest.mock('./break');
jest.mock('./look');
jest.mock('../../../core/socketUtil');

global.io = new mocks.IOMock();


// TODO: these tests need to be seperated out into tests for the character.move method
describe('move', () => {
  let socket = new mocks.SocketMock();
  socket.character.move = jest.fn(() => Promise.resolve());

  describe('execute', () => {

    test('should call character move method', () => {
      expect.assertions(1);

      return sut.execute(socket.character, directions.U).then(() => {
        expect(socket.character.move).toHaveBeenCalledWith(directions.U);
      });
    });
  });

  describe('help', () => {
    test('should print help message', () => {
      sut.help(socket.character);
      expect(socket.character.output).toHaveBeenCalled();
    });
  });
});
