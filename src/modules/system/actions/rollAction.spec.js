import mocks from '../../../../spec/mocks';
import { mockRoll } from '../../../core/dice';
import sut from './rollAction';

jest.mock('../../../core/dice');

describe('roll', () => {

  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    it('without die type should display Action Die results', () => {
      mockRoll.mockReturnValueOnce(1);
      expect.assertions(1);

      sut.execute(socket.character);

      expect(socket.character.output).toHaveBeenCalledWith('Action Die Roll Result:  1<br />');
    });

    it('with die type should display die type results', () => {
      mockRoll.mockReturnValueOnce(2);
      expect.assertions(1);

      sut.execute(socket.character, '1d4');

      expect(socket.character.output).toHaveBeenCalledWith('1d4 Roll Result:  2<br />');
    });
  });
});
