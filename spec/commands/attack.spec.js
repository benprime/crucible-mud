var attack = require('../../commands/attack.js');

const roomManager = require('../../roomManager');
const autocomplete = require('../../autocomplete');
const mocks = require('../mocks.js');
const SocketMock = new require('socket-io-mock');

describe('attack', function() {
    let socket;
    let room;
    let roomManagerSpy;
    let autocompleteResult;
    let autocompleteSpy;

    beforeAll(function() {
        socket = new SocketMock();
        room = mocks.getMockRoom();
        roomManagerSpy = spyOn(roomManager, 'getRoomById').and.callFake(() => room);
        autocompleteSpy = spyOn(autocomplete, 'autocomplete').and.callFake(() => autocompleteResult);
    });

    describe('dispatch triggers execute', function(){
        let executeSpy;

        beforeAll(function() {
            executeSpy = spyOn(attack, 'execute');
        });

        afterAll(function(){
            executeSpy.and.callThrough();
        });
        
        it('on short pattern', function(){
            autocompleteResult = 'thing';
            attack.dispatch(socket, ['a th', 'thing']);
            expect(executeSpy).toHaveBeenCalledWith(socket, autocompleteResult);
        });
    });

    describe('execute', function() {
        beforeAll(function(){
            socket = new SocketMock();
            socket.user = {
                username: 'aName', 
                roomId: 123 
            };
        });

        it('emits and broadcasts', function(){
            // passing a spy to the mock callback (it has both room and message)
            var spy = jasmine.createSpy('socketOutputSpy');
            socket.onEmit('output', spy);
            spyOn(socket, 'emit').and.callThrough();

            autocompleteResult = {
                id: 123,
                displayName: 'a thing!'
            };
            attack.execute(socket, 'thing');

            expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
            expect(spy).toHaveBeenCalledWith({ message: `${socket.user.username} moves to attack ${autocompleteResult.displayName}!` }, undefined);
        });
    })
});