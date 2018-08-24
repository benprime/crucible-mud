export const mockgetCharacterNames = jest.fn();
export const mockCharacterInRoom = jest.fn();
export const mockRoomMessage = jest.fn();
export const mockGetRoomSockets = jest.fn();
export const mockGetFollowingCharacters = jest.fn();
export const mockGetSocketByUserId = jest.fn();
export const mockGetSocketByCharacterId = jest.fn();
export const mockGetCharacterById = jest.fn();
export const mockGetCharacterByName = jest.fn();

const mock = {
  getCharacterNames: mockgetCharacterNames,
  roomMessage: mockRoomMessage,
  getRoomSockets: mockGetRoomSockets,
  characterInRoom: mockCharacterInRoom,
  getFollowingCharacters: mockGetFollowingCharacters,
  getSocketByUserId: mockGetSocketByUserId,
  getSocketByCharacterId: mockGetSocketByCharacterId,
  getCharacterById: mockGetCharacterById,
  getCharacterByName: mockGetCharacterByName,
};

export default mock;