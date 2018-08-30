import mocks from '../../spec/mocks';
import sut from './catalog';


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
      sut.execute(socket, mobCatalog, 'mob');

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: expectedString });
    });

    test('should lists item catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th></tr><tr><td>item 1</td></tr>\n<tr><td>item 2</td></tr></table>';

      // act
      sut.execute(socket, itemCatalog, 'item');

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: expectedString });
    });

    test('should list key catalog', () => {
      // arrange
      const expectedString = '<table><tr><th>Name</th></tr><tr><td>key 1</td></tr>\n<tr><td>key 2</td></tr></table>';

      // act
      sut.execute(socket, itemCatalog, 'key');

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: expectedString });
    });

  });

  test('should be an admin command', () => {
    expect(sut.admin).toBe(true);
  });
});
