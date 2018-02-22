'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/take');
const autocomplete = require('../../autocomplete');
const Room = require('../../models/room');

describe('take', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('dispatch', function(){
    beforeEach(function(){
      spyOn(sut, 'execute');
      socket.emit.calls.reset();
    });

    it('should call execute with match', function(){
      sut.dispatch(socket, ['take', 'aItem']);
      expect(sut.execute).toHaveBeenCalledWith(socket, 'aItem');
    });

    it('should output message if multiple matches', function(){
      sut.dispatch(socket, 'take', 'aItem', 'anotherItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'What do you want to take?' });
    });
  });


  describe('execute', function () {
    let otherUserSocket = new mocks.SocketMock();
    beforeEach(function(){
      spyOn(global, 'GetSocketByUsername').and.returnValue(otherUserSocket);
    })

    it('should add offered item to inventory', function(){
      let offeredItem = {id: 'aItemId', name:'aItem'}
      otherUserSocket.user.inventory = [offeredItem];
      socket.offers = [{ 
        fromUserName: 'aUser',
        toUserName: 'TestUser',
        item: offeredItem
      }]

      sut.execute(socket, 'aItem');

      expect(socket.user.inventory[0].name).toEqual('aItem');
      expect(otherUserSocket.user.inventory.length).toEqual(0);
    });

    xit('should output message when item is not found', function() {
    });
    xit('should output message when item is fixed', function() {
    });
    xit('should update the room/user and save room/user to database', function() {
    });
    xit('should output message when command successful', function() {
    });
  });
});