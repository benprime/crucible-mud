export const mockGetRoomById = jest.fn();
export const mockRoomCache = {};
export const mockGetByCoords = jest.fn();
export const mockGetCharacters = jest.fn();

// mock must be a function for when constructing new model instances
const mock = jest.fn().mockImplementation(() => {
  return {};
});

mock.getById = mockGetRoomById;
mock.roomCache = mockRoomCache;
mock.getCharacters = mockGetCharacters;
mock.getByCoords = mockGetByCoords;


export default mock;