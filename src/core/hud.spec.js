import hud from './hud';
import mocks from '../../spec/mocks';

describe('updateHUD', () => {
  test('emits message with hud type and appropriate parameters', () => {
    // arrange
    const socket = new mocks.SocketMock();

    // act
    hud.updateHUD(socket);

    // assert
    expect(socket.emit).toBeCalledWith('hud', {
      currentHP: socket.user.currentHP,
      maxHP: socket.user.maxHP,
    });
  });
});
