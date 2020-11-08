import Character from './character';

describe('character model', () => {
  let character;

  describe('nextExp', () => {
    beforeEach(() => {
      character = new Character({
        level: 1,
        xp: 0,
        save: jasmine.createSpy('charactersave'),
      });
    });

    test('returns correct value at level 1', () => {
      const result = character.nextExp();

      expect(character.level).toBe(1);
      expect(result).toBe(300);
    });

    test('returns correct value at level 10', () => {
      character.level = 10;
      const result = character.nextExp();

      expect(result).toBe(153600);
    });

    describe('addExp', () => {

      beforeEach(() => {
        character = new Character({
          level: 1,
          xp: 0,
        });
        character.save = jest.fn();
      });

      test('saves correct value when experience is added', () => {
        character.addExp(10);

        expect(character.xp).toBe(10);
        expect(character.level).toBe(1);
        expect(character.save).toHaveBeenCalled();
      });

      test('changes level when character has enough experience for level 2', () => {
        character.addExp(310);

        expect(character.xp).toBe(310);
        expect(character.level).toBe(2);
        expect(character.save).toHaveBeenCalled();
      });
    });
  });

});
