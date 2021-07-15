import { extractPartsFromPath } from './selectors';

describe('router/selectors', () => {
  describe('extractPartsFromPath', () => {
    it('return pathName, query and parse store data from window.location', () => {
      const store = { useHash: false } as any;
      const results = extractPartsFromPath(store);
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
      const store = { useHash: false, serializers } as any;
      const results = extractPartsFromPath(store);
      expect(results).toEqual({
        pathName: '/page1',
        query: 'queryParam=queryValue&a[]=1&a[]=2',
        storeData: {
          counter: { value: 2 },
          counter2: { value: 2 },
        },
      });
    });

    it('parses window.hash if store.useHash is true', () => {
      const store = { useHash: true } as any;
      window.location.hash = '#page1';
      const results = extractPartsFromPath(store);
      expect(results).toEqual({
        pathName: '/page1',
        query: '',
        storeData: {},
      });
    });

    it('returns an empty object if the store is badly formed', () => {
      const store = { useHash: true } as any;
      window.location.hash = '#?storeData={';
      expect(extractPartsFromPath(store)).toEqual({
        pathName: '/',
        query: '',
        storeData: {},
      });
    });

    it('returns an empty object if the no store is found', () => {
      const store = { useHash: true } as any;
      window.location.hash = '#?a=1';
      expect(extractPartsFromPath(store)).toEqual({
        pathName: '/',
        query: 'a=1',
        storeData: {},
      });
    });

    it('pathName defaults to / when useHash is true', () => {
      history.pushState(null, null, 'http://example.com');
      const store = { useHash: true } as any;
      const results = extractPartsFromPath(store);
      expect(results).toEqual({
        pathName: '/',
        query: '',
        storeData: {},
      });
    });
  });
});
