'use strict';

const hud = require('./hud');
const mocks = require('../../spec/mocks');

describe('updateHUD', function () {
  it('emits message with hud type and appropriate parameters', function () {
    // arrange
    const socket = new mocks.SocketMock();

    // act
    hud.updateHUD(socket);

    // assert
    expect(socket.emit).toHaveBeenCalledWith('hud', {
      currentHP: socket.user.currentHP,
      maxHP: socket.user.maxHP,
    });
  });
});
