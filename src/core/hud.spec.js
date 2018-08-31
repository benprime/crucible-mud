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
      currency: 0,
      currentHP: socket.character.currentHP,
      maxHP: socket.character.maxHP,
      dayPhase: 'early morning',
      states: [],
      status: 'unharmed',
    });
  });
});
