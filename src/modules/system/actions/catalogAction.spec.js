import mocks from '../../../../spec/mocks';
import sut from './catalogAction';


describe('catalog', () => {
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
  });

  describe('execute', () => {
    test('should lists mob catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th></tr><tr><td>mob 1</td></tr></table>';

      // act
      sut.execute(socket.character, mobCatalog, 'mob');

      // assert
      expect(socket.character.output).toHaveBeenCalledWith(expectedString);
    });

    test('should lists item catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th></tr><tr><td>item 1</td></tr>\n<tr><td>item 2</td></tr></table>';

      // act
      sut.execute(socket.character, itemCatalog, 'item');

      // assert
      expect(socket.character.output).toHaveBeenCalledWith(expectedString);
    });

    test('should list key catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th></tr><tr><td>key 1</td></tr>\n<tr><td>key 2</td></tr></table>';

      // act
      sut.execute(socket.character, itemCatalog, 'key');

      // assert
      expect(socket.character.output).toHaveBeenCalledWith(expectedString);
    });

  });
});
