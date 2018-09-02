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

      expect(socket.character.output).toHaveBeenCalled();
    });

    test('should display topic help with a parameter', () => {
      sut.execute(socket.character, 'gossip');

      expect(socket.character.output).toHaveBeenCalled();
    });

    test('should display error message when topic is invalid', () => {
      sut.execute(socket.character, 'yourface');
      
      //check output for bad command
      expect(socket.character.output).toHaveBeenCalledWith('No help for that topic.');

    });
  });

});
