import mocks from '../../spec/mocks';
import sut from './help';

describe('help', () => {
  let socket;
  let command;

  beforeAll(() => {
    socket = new mocks.SocketMock();

    command = {
      name: 'gossip',
      help: jasmine.createSpy('gossip'),
    };

    sut.registerCommand(command);
  });

  xdescribe('execute', () => {

    test('should display general help with no parameters', () => {
      return sut.execute(socket.character).then(response => {
        expect(response).not.toBeNull();
      });

    });

    test('should display topic help with a parameter', () => {
      return sut.execute(socket.character, 'gossip').then(response => {
        expect(response).not.toBeNull();
      });


    });

    test('should display error message when topic is invalid', () => {
      return sut.dispatch(socket, 'yourface').catch(response => {
        //check output for bad command
        expect(response).toEqual('No help for that topic.');
      });

    });
  });

});
