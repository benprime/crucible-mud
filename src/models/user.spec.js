'use strict';

const User = require('../models/user');

describe('user model', function () {
  let user;
  let saveCalled;

  describe('nextExp', function() {
    beforeEach(function () {
      user = new User({
        level: 1,
        xp: 0,
        save: jasmine.createSpy('usersave'),
      });
    });

    it('returns correct value at level 1', function() {
      var result = user.nextExp();

      expect(user.level).toBe(1);
      expect(result).toBe(300);
    });

    it('returns correct value at level 10', function() {
      user.level = 10;
      var result = user.nextExp();

      expect(result).toBe(153600);
    });

    describe('addExp', function() {

      beforeEach(function () {
        user = new User({
          level: 1,
          xp: 0,
        });
        saveCalled = false;
        // janky work around for mongoose spying
        spyOn(User.prototype, 'save').and.callFake(function() {
          saveCalled = true;
        });
      });

      it('saves correct value when experience is added', function() {
        user.addExp(10);

        expect(user.xp).toBe(10);
        expect(user.level).toBe(1);
        expect(saveCalled).toBe(true);
      });

      it('changes level when user has enough experience for level 2', function() {
        user.addExp(310);

        expect(user.xp).toBe(310);
        expect(user.level).toBe(2);
        expect(saveCalled).toBe(true);
      });
    });
  });

});
