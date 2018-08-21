export const mockCharactersInRoom = jest.fn();
export const mockCharacterInRoom = jest.fn();
export const mockRoomMessage = jest.fn();
export const mockGetRoomSockets = jest.fn();
export const mockGetFollowingCharacters = jest.fn();
export const mockGetSocketByUserId = jest.fn();
export const mockGetSocketByUsername = jest.fn();
export const mockGetCharacterById = jest.fn();
export const mockGetSocketByCharacterId = jest.fn();
export const mockGetCharacterByName = jest.fn();

const mock = {
  charactersInRoom: mockCharactersInRoom,
  roomMessage: mockRoomMessage,
  getRoomSockets: mockGetRoomSockets,
  characterInRoom: mockCharacterInRoom,
  getFollowingCharacters: mockGetFollowingCharacters,
  getSocketByUserId: mockGetSocketByUserId,
  getSocketByUsername: mockGetSocketByUsername,
  getCharacterById: mockGetCharacterById,
  getSocketByCharacterId: mockGetSocketByCharacterId,
  getCharacterByName: mockGetCharacterByName,
};

export default mock;