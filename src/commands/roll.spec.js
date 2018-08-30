import mocks from '../../spec/mocks';
import { mockRoll } from '../core/dice';
import sut from './roll';

jest.mock('../core/dice');

describe('roll', () => {

  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    it('without die type should display Action Die results', () => {
      mockRoll.mockReturnValueOnce(1);

      return sut.execute(socket.character).then(response => {
        expect(response).toEqual('Action Die Roll Result:  1<br />');
      });

    });

    it('with die type should display die type results', () => {
      mockRoll.mockReturnValueOnce(2);

      return sut.execute(socket.character, '1d4').then(response => {
        expect(response).toEqual('1d4 Roll Result:  2<br />');
      });

    });
  });
});
