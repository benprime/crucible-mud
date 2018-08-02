export const mockUsersInRoom = jest.fn();
export const mockSocketInRoom = jest.fn();
export const mockRoomMessage = jest.fn();
export const mockGetRoomSockets = jest.fn();
export const mockValidUserInRoom = jest.fn();
export const mockGetFollowingSockets = jest.fn();
export const mockGetSocketByUserId = jest.fn();
export const mockGetSocketByUsername = jest.fn();




// const mock = jest.fn().mockImplementation(() => {
//   return {
//     autocompleteTypes: mockAutocompleteTypes
//   };
// });

const mock = {
    usersInRoom: mockUsersInRoom,
    socketInRoom: mockSocketInRoom,
    roomMessage: mockRoomMessage,
    getRoomSockets: mockGetRoomSockets,
    validUserInRoom: mockValidUserInRoom,
    getFollowingSockets: mockGetFollowingSockets,
    getSocketByUserId: mockGetSocketByUserId,
    getSocketByUsername: mockGetSocketByUsername,
};

export default mock;