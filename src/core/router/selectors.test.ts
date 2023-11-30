import { extractPartsFromPath, getPath } from './selectors';

describe('router/selectors', () => {
  const testPath =
    '/page1?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A1%7D%2C%22counter2%22%3A%7B%22value%22%3A2%7D%7D';
  describe(extractPartsFromPath, () => {
    it('returns pathName, query and parses store data', () => {
      const results = extractPartsFromPath(testPath);
      expect(results).toEqual({
        pathName: '/page1',
        query: 'queryParam=queryValue&a[]=1&a[]=2',
        storeData: {
          counter: { value: 1 },
          counter2: { value: 2 },
        },
      });
    });

    it('passes url through serializers', () => {
      const serializers = new Map([
        [
          'counter',
          {
            toUrlValue: (value) => value,
            fromUrlValue: (counter) => {
              counter.value *= 2;
              return counter;
            },
          },
        ],
      ]);
      const results = extractPartsFromPath(testPath, serializers);
      expect(results).toEqual({
        pathName: '/page1',
        query: 'queryParam=queryValue&a[]=1&a[]=2',
        storeData: {
          counter: { value: 2 },
          counter2: { value: 2 },
        },
      });
    });

    it('returns an empty object if the store data is badly serialized', () => {
      expect(extractPartsFromPath('/?storeData={')).toEqual({
        pathName: '/',
        query: '',
        storeData: {},
      });
    });

    it('returns an empty object if the no store is found', () => {
      expect(extractPartsFromPath('/?a=1')).toEqual({
        pathName: '/',
        query: 'a=1',
        storeData: {},
      });
    });
  });

  describe(getPath, () => {
    it('parses window.hash if store.useHash is true', () => {
      const store = { useHash: true } as any;
      window.location.hash = '#page1';
      const results = getPath(store);
      expect(results).toBe('/page1');
    });
  });
});
