export const mockGetAreaById = jest.fn();
export const mockGetByName = jest.fn();
export const mockAreaCache = {};

// mock must be a function for when constructing new model instances
const mock = jest.fn().mockImplementation(() => {
  return {};
});

// add static methods
// this feels like the wrong way to do this.
mock.getById = mockGetAreaById;
mock.getByName = mockGetByName;
mock.areaCache = mockAreaCache;

export default mock;