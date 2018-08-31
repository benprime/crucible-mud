import mocks from '../../spec/mocks';
import commandManager from '../core/commandManager';
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

    commandManager.commands[command.name] = command;
  });

  describe('execute', () => {

    test('should display general help with no parameters', () => {
      sut.execute(socket);

      expect(socket.emit).toHaveBeenCalled();
    });

    test('should display topic help with a parameter', () => {
      sut.execute(socket, 'gossip');

      expect(socket.emit).toHaveBeenCalled();
    });

    test('should display error message when topic is invalid', () => {
      sut.execute(socket, 'yourface');
      //check output for bad command
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No help for that topic.' });

    });
  });

});
