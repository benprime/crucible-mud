export const mockRoll = jest.fn();
export const mockGetRandomNumber = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    roll: mockRoll
  };
});

mock.roll = mockRoll;
mock.getRandomNumber = mockGetRandomNumber;

export default mock;