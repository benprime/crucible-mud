import Character from './character';
import Item from './item';

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

    describe('addItem', () => {

      beforeEach(() => {
        character = new Character();
        character.save = jest.fn();
      });

      let firstTestItem = new Item({
        name: 'a name',
        desc: 'a description',
        type: 'item',
        hidden: false,
      });

      let secondTestItem = new Item({
        name: 'a second name',
        desc: 'a second description',
        type: 'key',
        hidden: true,
      });

      test('saves correct value when first item is added', () => {
        character.addItem(firstTestItem);

        expect(character.inventory).toHaveLength(1);
        expect(character.inventory[0].name).toEqual('a name');
        expect(character.inventory[0].desc).toEqual('a description');
        expect(character.inventory[0].type).toEqual('item');
        expect(character.save).toHaveBeenCalled();
      });

      test('saves correct values when multiple items are added', () => {
        character.addItem(firstTestItem);
        character.addItem(secondTestItem);

        expect(character.inventory).toHaveLength(2);

        expect(character.inventory[0].name).toEqual('a name');
        expect(character.inventory[0].desc).toEqual('a description');
        expect(character.inventory[0].type).toEqual('item');

        expect(character.inventory[1].name).toEqual('a second name');
        expect(character.inventory[1].desc).toEqual('a second description');
        expect(character.inventory[1].type).toEqual('key');
        expect(character.save).toHaveBeenCalledTimes(2);
      });
    });
  });
});
