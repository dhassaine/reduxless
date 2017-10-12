/* global describe, it, expect */
import { createStore } from '../../src/main';
import { enableHistory } from './index';

describe('enableHistory', () => {
  describe('on initial page load', () => {
    it('syncs the url to the store', () => {
      const store = createStore();
      enableHistory(store);

      expect(store.get('location')).toHaveProperty('href', 'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2');
    });

    it('syncs the pathname to the store', () => {
      const store = createStore();
      enableHistory(store);

      expect(store.get('location')).toHaveProperty('pathname', '/page1');
    });

    it('syncs the query string to the store', () => {
      const store = createStore();
      enableHistory(store);

      expect(store.get('location')).toHaveProperty('queryString', '?queryParam=queryValue&a[]=1&a[]=2');
    });

    it('syncs the query parameters to the store', () => {
      const store = createStore();
      enableHistory(store);

      expect(store.get('location')).toHaveProperty('query', {
        queryParam: 'queryValue',
        'a': [
          '1',
          '2'
        ]
      });
    });
  });

  describe('on history change', () => {
    it('syncs property changes', (done) => {
      const store = createStore();
      enableHistory(store);
      const assertions = [
        () => {
          expect(store.get('location')).toHaveProperty('href', 'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2');
          expect(store.get('location')).toHaveProperty('pathname', '/page1');
          expect(store.get('location')).toHaveProperty('queryString', '?queryParam=queryValue&a[]=1&a[]=2');
          expect(store.get('location')).toHaveProperty('query', {
            queryParam: 'queryValue',
            a: ['1', '2']
          });
        },

        () => {
          expect(store.get('location')).toHaveProperty('href', 'http://example.com/page2');
          expect(store.get('location')).toHaveProperty('pathname', '/page2');
          expect(store.get('location')).toHaveProperty('queryString', '');
          expect(store.get('location')).toHaveProperty('query', {});
        },

        () => {
          expect(store.get('location')).toHaveProperty('href', 'http://example.com/page3?queryParam=queryValue&a[]=1&a[]=2');
          expect(store.get('location')).toHaveProperty('pathname', '/page3');
          expect(store.get('location')).toHaveProperty('queryString', '?queryParam=queryValue&a[]=1&a[]=2');
          expect(store.get('location')).toHaveProperty('query', {
            queryParam: 'queryValue',
            a: ['1', '2']
          });
        }
      ];

      store.subscribe(() => {
        const assert = assertions.pop();

        try {
          assert();
        } catch (error) {
          done(error);
        }

        history.back();

        if (assertions.length === 0) {
          done();
        }
      });

      history.pushState(null, null, '/page2');
      history.pushState(null, null, '/page3?queryParam=queryValue&a[]=1&a[]=2');
      history.pushState(null, null, '/page4');

      history.back();
    });
  });
});
