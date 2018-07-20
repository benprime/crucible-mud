'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

// requiring models to use their constuctors directly
const Mob = require('../models/mob');
const Item = require('../models/item');

let mockRoom = mocks.getMockRoom();
const sut = SandboxedModule.require('./spawn', {
  requires: {
    '../models/room': {
      getById: jasmine.createSpy('getByIdSpy').and.callFake(() => mockRoom),
    },
    '../models/mob': Mob,
    '../models/item': Item,
  },
});

describe('spawn', () => {
  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    describe('when type is mob', () => {
      it('should output message when type name is invalid', () => {
        sut.execute(socket, 'mob', 'name');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown mob type.' });
      });

      it('should create instance of mob in room mobs list', () => {
        sut.execute(socket, 'mob', 'kobold');

        expect(mockRoom.mobs.length).toBe(1);
        expect(mockRoom.mobs[0].displayName.endsWith('kobold sentry')).toBeTruthy();
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Summoning successful.' });
        expect(mockRoom.save).not.toHaveBeenCalled();
      });
    });

    describe('when type is item', () => {
      it('should output message when type name is invalid', () => {
        sut.execute(socket, 'item', 'name');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown item type.' });
      });

      it('should create instance of item in user inventory', () => {
        sut.execute(socket, 'item', 'shortsword');

        expect(socket.user.inventory.length).toBe(1);
        expect(socket.user.inventory[0].displayName).toBe('short sword');
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Item created.' });
        expect(socket.user.save).toHaveBeenCalled();
      });
    });

    describe('when type is key', () => {
      it('should output message when type name is invalid', () => {
        sut.execute(socket, 'key', 'name');

        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown key type.' });
      });

      it('should create instance of key in user keys', () => {
        sut.execute(socket, 'key', 'jadekey');

        expect(socket.user.keys.length).toBe(1);
        expect(socket.user.keys[0].displayName).toBe('jade key');
        expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Key created.' });
        expect(socket.user.save).toHaveBeenCalled();
      });
    });

    it('should output message when object type is invalid', () => {
      sut.execute(socket, 'unknownType', 'name');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown object type.' });
    });
  });
});
