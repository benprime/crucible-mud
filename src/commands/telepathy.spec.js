import { mockAutocompleteCharacter } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './telepathy';


jest.mock('../models/room');
jest.mock('../core/autocomplete');


global.io = new mocks.IOMock();


describe('telepathy', () => {
  let socket;
  let otherSocket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123, username: 'TestUser' };
    otherSocket = new mocks.SocketMock();
    otherSocket.user = { roomId: 321, username: 'OtherUser' };
  });

  describe('execute', () => {

    test('should output messages when user is invalid', () => {
      // arrange
      const msg = 'This is a telepath message!';
      mockAutocompleteCharacter.mockReturnValueOnce(null);

      // act
      return sut.execute(socket.character, 'Wrong', msg).catch(response => {
        // assert
        expect(response).toEqual('Invalid username.');
      });

    });

    test('should output messages when command is successful', () => {
      // arrange
      const msg = 'This is a telepath message!';
      mockAutocompleteCharacter.mockReturnValueOnce(otherSocket.character);

      // act
      return sut.execute(socket.character, otherSocket.character.name, msg).then(response => {
        // assert
        expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: `Telepath to ${otherSocket.character.name}: <span class="silver">This is a telepath message!</span>` });
        expect(response.charMessages).toContainEqual({ charId: otherSocket.character.id, message: `${socket.character.name} telepaths: <span class="silver">This is a telepath message!</span>` });
      });


    });

  });

});
