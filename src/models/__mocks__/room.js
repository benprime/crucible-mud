export const mockGetRoomById = jest.fn();
export const mockValidDirectionInput = jest.fn();
export const mockShortToLong = jest.fn();
export const mockLongToShort = jest.fn();
export const mockOppositeDirection = jest.fn();
export const mockRoomCache = {};
export const mockGetByCoords = jest.fn();
export const mockGetCharacters = jest.fn();

// mock must be a function for when constructing new model instances
const mock = jest.fn().mockImplementation(() => {
  return {
    // getById: mockGetRoomById,
    // validDirectionInput: mockValidDirectionInput,
  };
});


// add static methods
// this feels like the wrong way to do this.
mock.getById = mockGetRoomById;
mock.validDirectionInput = mockValidDirectionInput;
mock.shortToLong = mockShortToLong;
mock.longToShort = mockLongToShort;
mock.oppositeDirection = mockOppositeDirection;
mock.roomCache = mockRoomCache;
mock.getCharacters = mockGetCharacters;

// mongoose
mock.getByCoords = mockGetByCoords;


export default mock;