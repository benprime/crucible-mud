import mocks from '../../../../spec/mocks';
import sut from './catalogAction';


// TODO: this is now using data from the files, instead of the mock data in the tests.
// re-implment these tests when the date is being pulled from the database.
xdescribe('catalog', () => {
  let socket;
  let itemCatalog;
  let mobCatalog;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    itemCatalog = {
      catalog: [
        {
          type: 'key',
          name: 'key 1',
        },
        {
          type: 'key',
          name: 'key 2',
        },
        {
          type: 'item',
          name: 'item 1',
        },
        {
          type: 'item',
          name: 'item 2',
        },
      ],
    };
    mobCatalog = {
      catalog: [
        {
          type: 'mob',
          name: 'mob 1',
        },
      ],
    };
  });

  beforeEach(() => {
    socket.emit.mockReset();
    socket.character.output.mockReset();
  });

  describe('execute', () => {
    test('should lists mob catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th></tr><tr><td>mob 1</td></tr></table>';

      // act
      sut.execute(socket.character, 'mobs');

      // assert
      expect(socket.character.output).toHaveBeenCalledWith(expectedString);
    });

    test('should lists item catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th></tr><tr><td>item 1</td></tr>\n<tr><td>item 2</td></tr></table>';

      // act
      sut.execute(socket.character, 'items');

      // assert
      expect(socket.character.output).toHaveBeenCalledWith(expectedString);
    });

    test('should list key catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th></tr><tr><td>key 1</td></tr>\n<tr><td>key 2</td></tr></table>';

      // act
      sut.execute(socket.character, 'keys');

      // assert
      expect(socket.character.output).toHaveBeenCalledWith(expectedString);
    });

  });
});
