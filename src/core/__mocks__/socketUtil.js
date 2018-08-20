export const mockUsersInRoom = jest.fn();
export const mockCharacterInRoom = jest.fn();
export const mockRoomMessage = jest.fn();
export const mockGetRoomSockets = jest.fn();
export const mockGetFollowingSockets = jest.fn();
export const mockGetSocketByUserId = jest.fn();
export const mockGetSocketByUsername = jest.fn();
export const mockGetCharacterById = jest.fn();
export const mockGetSocketByCharacterId = jest.fn();

const mock = {
  usersInRoom: mockUsersInRoom,
  roomMessage: mockRoomMessage,
  getRoomSockets: mockGetRoomSockets,
  characterInRoom: mockCharacterInRoom,
  getFollowingSockets: mockGetFollowingSockets,
  getSocketByUserId: mockGetSocketByUserId,
  getSocketByUsername: mockGetSocketByUsername,
  getCharacterById: mockGetCharacterById,
  getSocketByCharacterId: mockGetSocketByCharacterId
};

export default mock;