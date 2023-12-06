import { debounce } from './index';
import { createRouterEnabledStore } from '../index';

const serializeURLDTO = (obj) => {
  const serialized = {};
  for (const [key, value] of Object.entries(obj))
    serialized[key] = JSON.stringify(value);
  return JSON.stringify(serialized);
};

const url =
  'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2&storeData=' +
  encodeURIComponent(
    serializeURLDTO({
      counter: { value: 1 },
      counter2: { value: 2 },
    }),
  );

describe('router/index', () => {
  describe('enableHistory', () => {
    describe('on initial page load', () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        window.history.pushState(null, null, url);
      });

      it('syncs storeData from the query parameters to the store', () => {
        const store = createRouterEnabledStore({
          pushStateMountPoints: ['counter', 'counter2'],
        });
        unsubscribe = store.subscribe(jest.fn());

        expect(store.get('counter')).toEqual({ value: 1 });
        expect(store.get('counter2')).toEqual({ value: 2 });
      });
    });

    describe('on history change', () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        window.history.pushState(null, null, url);
      });

      it('syncs registered storeData from window.location to the store', (done) => {
        const pushStateMountPoints = ['counter', 'counter2'];
        const store = createRouterEnabledStore({
          pushStateMountPoints,
        });
        unsubscribe = store.subscribe(jest.fn());

        expect(store.get('counter')).toEqual({ value: 1 });
        expect(store.get('counter2')).toEqual({ value: 2 });

        store.setAll({ counter: { value: 2 }, counter2: { value: 3 } });
        expect(store.get('counter')).toEqual({ value: 2 });
        expect(store.get('counter2')).toEqual({ value: 3 });

        const popPromise = getPopStatePromise();
        window.history.back();
        popPromise.then(() => {
          expect(store.get('counter')).toEqual({ value: 1 });
          expect(store.get('counter2')).toEqual({ value: 2 });
          done();
        });
      });

      it('changes made directly to the registered sync data in the store automatically update the browser location', (done) => {
        jest.useFakeTimers();
        const store = createRouterEnabledStore({
          pushStateMountPoints: ['counter', 'counter2'],
          routerOptions: {
            debounceTime: 1000,
          },
        });
        unsubscribe = store.subscribe(jest.fn());

        expect(store.get('counter')).toEqual({ value: 1 });
        expect(store.get('counter2')).toEqual({ value: 2 });
        store.setAll({ counter: { value: 2 }, counter2: { value: 3 } });

        setTimeout(() => {
          expect(window.location).toHaveProperty(
            'search',
            '?queryParam=queryValue&a[]=1&a[]=2&storeData=' +
              encodeURIComponent(
                serializeURLDTO({
                  counter: { value: 2 },
                  counter2: { value: 3 },
                }),
              ),
          );
          jest.useRealTimers();
          done();
        });

        jest.runOnlyPendingTimers();
      });

      it('mountpoints are passed through serializers', () => {
        const serializers = {
          counter: {
            toUrlValue: (counter) =>
              JSON.stringify({
                value: parseFloat(counter.value) * 2,
              }),
            fromUrlValue: (counter) => ({
              value: JSON.parse(counter).value / 2,
            }),
          },
        };
        const store = createRouterEnabledStore({
          pushStateMountPoints: ['counter', 'counter2'],
          serializers,
        });
        unsubscribe = store.subscribe(jest.fn());

        expect(store.get('counter')).toEqual({ value: 0.5 });
        store.set('counter', { value: 2 });

        expect(window.location).toHaveProperty(
          'search',
          '?queryParam=queryValue&a[]=1&a[]=2&storeData=' +
            encodeURIComponent(
              serializeURLDTO({
                counter: { value: 4 },
                counter2: { value: 2 },
              }),
            ),
        );
        expect(store.get('counter')).toEqual({ value: 2 });
      });

      it('changes made directly to the replaceStateMountPoints and pushStateMountPoints in the store replace the browser location', (done) => {
        jest.useFakeTimers();

        const oldPush = window.history.pushState;
        const oldReplace = window.history.replaceState;

        const pushState = (window.history.pushState = jest.fn(
          oldPush.bind(window.history),
        ));
        const replaceState = (window.history.replaceState = jest.fn(
          oldReplace.bind(window.history),
        ));

        const store = createRouterEnabledStore({
          pushStateMountPoints: ['counter'],
          replaceStateMountPoints: ['counter2'],
          routerOptions: {
            debounceTime: 1000,
          },
        });

        const assertions = [
          () => {
            expect(store.get('counter')).toEqual({ value: 2 });
            expect(store.get('counter2')).toEqual({ value: 2 });
            expect(pushState.mock.calls.length).toEqual(1);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get('counter')).toEqual({ value: 2 });
            expect(pushState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get('counter')).toEqual({ value: 2 });
            expect(store.get('counter2')).toEqual({ value: 3 });
            expect(pushState.mock.calls.length).toEqual(1);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get('counter')).toEqual({ value: 3 });
            expect(store.get('counter2')).toEqual({ value: 3 });
            expect(pushState.mock.calls.length).toEqual(2);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get('counter')).toEqual({ value: 3 });
            expect(store.get('counter2')).toEqual({ value: 4 });
            expect(pushState.mock.calls.length).toEqual(2);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
        ];

        expect(replaceState.mock.calls.length).toEqual(0);
        unsubscribe = store.subscribe(() => {
          const assert = assertions.shift();
          try {
            assert();
          } catch (error) {
            window.history.pushState = oldPush;
            window.history.replaceState = oldReplace;
            unsubscribe();
            jest.useRealTimers();
            done(error);
          }

          if (assertions.length === 0) {
            setTimeout(() => {
              expect(replaceState.mock.calls.length).toEqual(2);
              window.history.pushState = oldPush;
              window.history.replaceState = oldReplace;
              unsubscribe();
              jest.useRealTimers();
              done();
            }, 2000);
            jest.runOnlyPendingTimers();
          }
        });

        expect(store.get('counter')).toEqual({ value: 1 });
        expect(store.get('counter2')).toEqual({ value: 2 });
        expect(replaceState.mock.calls.length).toEqual(1);

        store.set('counter', { value: 2 }); // pushState
        store.set('counter', { value: 2 }); // pushState
        store.set('counter2', { value: 3 }); // replaceState
        store.set('counter', { value: 3 }); // pushState
        store.set('counter2', { value: 4 }); // replaceState
      });

      it('changes made directly to the replaceStateMountPoints in the store replace the browser location', (done) => {
        jest.useFakeTimers();

        const oldPush = window.history.pushState;
        const oldReplace = window.history.replaceState;

        const pushState = (window.history.pushState = jest.fn(
          oldPush.bind(window.history),
        ));
        const replaceState = (window.history.replaceState = jest.fn(
          oldReplace.bind(window.history),
        ));

        const store = createRouterEnabledStore({
          initialState: { counter: { value: 1 } },
          replaceStateMountPoints: ['counter2'],
          routerOptions: {
            debounceTime: 1000,
          },
        });

        expect(replaceState.mock.calls.length).toEqual(0);

        const assertions = [
          () => {
            expect(store.get('counter')).toEqual({ value: 2 });
            expect(store.get('counter2')).toEqual({ value: 2 });
            expect(pushState.mock.calls.length).toEqual(0);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get('counter')).toEqual({ value: 2 });
            expect(store.get('counter2')).toEqual({ value: 3 });
            expect(pushState.mock.calls.length).toEqual(0);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get('counter')).toEqual({ value: 3 });
            expect(store.get('counter2')).toEqual({ value: 3 });
            expect(pushState.mock.calls.length).toEqual(0);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get('counter')).toEqual({ value: 3 });
            expect(store.get('counter2')).toEqual({ value: 4 });
            expect(pushState.mock.calls.length).toEqual(0);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
        ];

        unsubscribe = store.subscribe(() => {
          const assert = assertions.shift();

          try {
            assert();
          } catch (error) {
            window.history.pushState = oldPush;
            window.history.replaceState = oldReplace;
            jest.useRealTimers();
            done(error);
          }

          if (assertions.length === 0) {
            jest.runOnlyPendingTimers();
            expect(replaceState.mock.calls.length).toEqual(2);
            window.history.pushState = oldPush;
            window.history.replaceState = oldReplace;
            jest.useRealTimers();
            return done();
          }
        });

        expect(store.get('counter2')).toEqual({ value: 2 });
        expect(replaceState.mock.calls.length).toEqual(1);

        store.set('counter', { value: 2 }); // simple update
        store.set('counter2', { value: 3 }); // replaceState
        store.set('counter', { value: 3 }); // simple update
        store.set('counter2', { value: 4 }); // replaceState
      });

      describe('when there are multiple subscriptions to the store', () => {
        describe('when at least one unsubscribe has been invoked', () => {
          it('state is restored on browse back', (done) => {
            window.history.pushState(null, null, 'http://example.com/page1');
            const store = createRouterEnabledStore({
              initialState: { val: 0 },
              pushStateMountPoints: ['val'],
            });
            unsubscribe = store.subscribe(jest.fn());
            const unsubscribe2 = store.subscribe(jest.fn());
            unsubscribe2();
            store.set('val', 1);
            expect(store.get('val')).toEqual(1);

            const popPromise = getPopStatePromise();
            window.history.back();
            popPromise.then(() => {
              expect(store.get('val')).toEqual(0);
              done();
            });
          });
        });
      });
    });

    describe('navigate', () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        history.pushState(null, null, url);
      });

      it('pushes the path to the browser state', () => {
        window.history.pushState(null, null, 'http://example.com/page1');
        const store = createRouterEnabledStore();
        unsubscribe = store.subscribe(jest.fn());
        store.navigate('page2');
        expect(window.location.href).toEqual('http://example.com/page2');
      });

      it('maintains the store data', () => {
        window.history.pushState(null, null, 'http://example.com/page1');
        const store = createRouterEnabledStore({
          initialState: { counter: { value: 1 } },
          pushStateMountPoints: ['counter'],
        });
        unsubscribe = store.subscribe(jest.fn());
        store.navigate('page2');
        expect(window.location.href).toEqual(
          'http://example.com/page2?storeData=' +
            encodeURIComponent(serializeURLDTO({ counter: { value: 1 } })),
        );
      });

      it('pushes the path to the browser state if hash is being used', () => {
        window.history.pushState(null, null, 'http://example.com/page1');
        const store = createRouterEnabledStore({
          routerOptions: { useHash: true },
        });
        unsubscribe = store.subscribe(jest.fn());
        store.navigate('page2');
        expect(window.location.href).toEqual('http://example.com/page2');
      });
    });

    describe('debounce', () => {
      beforeEach(() => jest.useFakeTimers());

      afterEach(jest.useRealTimers);

      it('should fire a function after the debounce time', () => {
        const callee = jest.fn();
        const timed = debounce(1000, callee);
        timed();
        jest.advanceTimersByTime(500);
        expect(callee.mock.calls.length).toEqual(0);
        jest.advanceTimersByTime(500);
        expect(callee.mock.calls.length).toEqual(1);
        jest.runOnlyPendingTimers();
      });

      it('should not trigger a pending call if interrupted by another', () => {
        const callee = jest.fn();
        const timed = debounce(1000, callee);
        timed();
        jest.advanceTimersByTime(500);
        expect(callee.mock.calls.length).toEqual(0);
        timed();
        jest.advanceTimersByTime(500);
        expect(callee.mock.calls.length).toEqual(0);
        jest.advanceTimersByTime(500);
        expect(callee.mock.calls.length).toEqual(1);
        jest.runOnlyPendingTimers();
      });

      it('should forward arguments for debounced function', () => {
        const callee = jest.fn();
        const timed = debounce(1000, callee);
        timed('dick', 'tracy');
        jest.runOnlyPendingTimers();
        expect(callee.mock.calls.length).toEqual(1);
        expect(callee.mock.calls[0]).toEqual(['dick', 'tracy']);
      });
    });
  });

  describe('Integrations', () => {
    let unsubscribe = null;

    afterEach(() => {
      if (unsubscribe) unsubscribe();
      history.pushState(
        null,
        null,
        'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2',
      );
    });

    it('pushState should not be called when updating a non sync mountpoint after using browser back', (done) => {
      const oldPush = window.history.pushState;
      const pushState = (window.history.pushState = jest.fn(
        oldPush.bind(window.history),
      ));

      const store = createRouterEnabledStore({
        initialState: {
          counter: { value: 1 },
          counter2: { value: 1 },
        },
        pushStateMountPoints: ['counter'],
      });

      expect(pushState.mock.calls.length).toEqual(0);
      store.navigate('page2');
      expect(pushState.mock.calls.length).toEqual(1);

      let navigated = false;
      unsubscribe = store.subscribe(() => {
        if (!navigated) {
          navigated = true;
          unsubscribe();
          store.navigate('page2');
          expect(pushState.mock.calls.length).toEqual(2);
          store.set('counter2', { value: 2 });
          expect(pushState.mock.calls.length).toEqual(2);
          window.history.pushState = oldPush;
          done();
        }
      });
      history.back();
    });
  });
});
function getPopStatePromise() {
  return new Promise((resolve) => {
    const popstate = () => {
      resolve(undefined);
      window.removeEventListener('popstate', popstate);
    };
    window.addEventListener('popstate', popstate);
  });
}
