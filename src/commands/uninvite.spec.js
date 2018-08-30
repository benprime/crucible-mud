import { mockAutocompleteCharacter } from '../core/autocomplete';
import { mockGetCharacterById } from '../core/socketUtil';
import mocks from '../../spec/mocks';
import sut from './uninvite';

jest.mock('../core/socketUtil');
jest.mock('../core/autocomplete');

describe('invite', () => {
  let leader;
  let follower1;
  let follower2;
  let follower3;

  beforeEach(() => {
    leader = mocks.getMockCharacter();
    leader.name = 'leader';

    follower1 = mocks.getMockCharacter();
    follower1.leader = leader.id;
    follower1.name = 'follower1';

    follower2 = mocks.getMockCharacter();
    follower2.leader = leader.id;
    follower2.name = 'follower2';

    follower3 = mocks.getMockCharacter();
    follower3.leader = leader.id;
    follower3.name = 'follower3';
  });

  describe('execute', () => {

    test('user is removed from party on valid username', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(follower2);
      mockGetCharacterById.mockReturnValueOnce(leader);

      return sut.execute(leader, follower2.name).then(() => {
        expect(follower1.leader).toBe(leader.id);
        expect(follower2.leader).toBeUndefined();
        expect(follower3.leader).toBe(leader.id);
      });
    });

    test('non-leader party member cannot remove other party members', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(follower2);

      return sut.execute(follower1, follower2.name).catch((response) => {
        expect(response).toBe(`You are not leading ${follower2.name} in a party.`);
        expect(follower1.leader).toBe(leader.id);
        expect(follower2.leader).toBe(leader.id);
        expect(follower3.leader).toBe(leader.id);
      });
    });


    test('user not in a party gets appropriate error message', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(follower2);
      const character = mocks.getMockCharacter();

      return sut.execute(character, follower1.name).catch((response) => {
        expect(response).toBe(`You are not leading ${follower2.name} in a party.`);

        // verify the party is unaffected
        expect(follower1.leader).toBe(leader.id);
        expect(follower2.leader).toBe(leader.id);
        expect(follower3.leader).toBe(leader.id);
      });
    });

  });

});
