export const mockgetCharacterNames = jest.fn();
export const mockRoomMessage = jest.fn();
export const mockGetRoomSockets = jest.fn();
export const mockGetFollowers = jest.fn();
export const mockGetSocketByUserId = jest.fn();
export const mockGetSocketByCharacterId = jest.fn();
export const mockGetCharacterById = jest.fn();
export const mockGetAllSockets = jest.fn();

const mock = {
  getCharacterNames: mockgetCharacterNames,
  roomMessage: mockRoomMessage,
  getRoomSockets: mockGetRoomSockets,
  getFollowers: mockGetFollowers,
  getSocketByUserId: mockGetSocketByUserId,
  getSocketByCharacterId: mockGetSocketByCharacterId,
  getCharacterById: mockGetCharacterById,
  getAllSockets: mockGetAllSockets,
};

export default mock;