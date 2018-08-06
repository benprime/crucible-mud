export const mockAutocompleteTypes = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    autocompleteTypes: mockAutocompleteTypes,
  };
});

mock.autocompleteTypes = mockAutocompleteTypes;

export default mock;