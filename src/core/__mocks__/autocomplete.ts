export const mockAutocompleteByProperty = jest.fn();
export const mockAutocompleteByProperties = jest.fn();
export const mockAutocompleteMultiple = jest.fn();
export const mockAutocompleteCharacter = jest.fn();
export const mockAutocompleteMob = jest.fn();
export const mockAutocompleteInventory = jest.fn();
export const mockAutocompleteKey = jest.fn();
export const mockAutocompleteRoom = jest.fn();

const mock = {
  byProperty:mockAutocompleteByProperty,
  byProperties:mockAutocompleteByProperties,
  multiple: mockAutocompleteMultiple,
  character: mockAutocompleteCharacter,
  mob: mockAutocompleteMob,
  inventory: mockAutocompleteInventory,
  key: mockAutocompleteKey,
  room: mockAutocompleteRoom,
};

export default mock;