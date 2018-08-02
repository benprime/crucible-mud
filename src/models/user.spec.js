import User from '../models/user';

describe('user model', () => {
  let user;
  let saveCalled;

  describe('nextExp', () => {
    beforeEach(() => {
      user = new User({
        level: 1,
        xp: 0,
        save: jasmine.createSpy('usersave'),
      });
    });

    test('returns correct value at level 1', () => {
      const result = user.nextExp();

      expect(user.level).toBe(1);
      expect(result).toBe(300);
    });

    test('returns correct value at level 10', () => {
      user.level = 10;
      const result = user.nextExp();

      expect(result).toBe(153600);
    });

    describe('addExp', () => {

      beforeEach(() => {
        user = new User({
          level: 1,
          xp: 0,
        });
        saveCalled = false;
        // janky work around for mongoose spying
        spyOn(User.prototype, 'save').and.callFake(() => {
          saveCalled = true;
        });
      });

      test('saves correct value when experience is added', () => {
        user.addExp(10);

        expect(user.xp).toBe(10);
        expect(user.level).toBe(1);
        expect(saveCalled).toBe(true);
      });

      test('changes level when user has enough experience for level 2', () => {
        user.addExp(310);

        expect(user.xp).toBe(310);
        expect(user.level).toBe(2);
        expect(saveCalled).toBe(true);
      });
    });
  });

});
