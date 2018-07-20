const dice = require('./dice');

describe('getRandomNumber', () => {
  it('number in range when min and max are same number', () => {
    // act
    const result = dice.getRandomNumber(5, 5);

    // assert
    expect(result).toBe(5);
  });

  it('number in range', () => {
    // act
    const result = dice.getRandomNumber(10, 15);

    // assert
    expect(result).toBeGreaterThanOrEqual(10);
    expect(result).toBeLessThanOrEqual(15);
  });
});
