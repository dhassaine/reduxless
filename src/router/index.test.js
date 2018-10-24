/* global describe, it, expect, jest, afterEach, beforeEach */
import React from 'react';
import { debounce } from './index';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { Match as _Match } from './Match';
import { makeComponents, createRouterEnabledStore } from '../index';
const MatchSimple = _Match(require('react'));
const { Container, Link, Match } = makeComponents(React);

const url =
  'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A1%7D%2C%22counter2%22%3A%7B%22value%22%3A2%7D%7D';

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
          pushStateMountPoints: ['counter', 'counter2']
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

      it('syncs registered storeData from window.location to the store', done => {
        const store = createRouterEnabledStore({
          pushStateMountPoints: ['counter', 'counter2']
        });

        const assertions = [
          () => {
            expect(store.get('counter')).toEqual({ value: 1 });
            expect(store.get('counter2')).toEqual({ value: 2 });
          },
          () => {
            expect(store.get('counter')).toEqual({ value: 2 });
            expect(store.get('counter2')).toEqual({ value: 3 });
          }
        ];

        unsubscribe = store.subscribe(() => {
          const assert = assertions.pop();

          try {
            assert();
          } catch (error) {
            done(error);
          }

          if (assertions.length === 0) {
            return done();
          }
          window.history.back();
        });

        window.history.pushState(
          null,
          null,
          'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A2%7D%2C%22counter2%22%3A%7B%22value%22%3A3%7D%7D'
        );
        window.history.pushState(null, null, '/ignored');
        window.history.back();
      });

      it('changes made directly to the registered sync data in the store automatically update the browser location', done => {
        jest.useFakeTimers();
        const store = createRouterEnabledStore({
          pushStateMountPoints: ['counter', 'counter2'],
          routerOptions: {
            debounceTime: 1000
          }
        });
        unsubscribe = store.subscribe(jest.fn());

        expect(store.get('counter')).toEqual({ value: 1 });
        expect(store.get('counter2')).toEqual({ value: 2 });
        store.setAll({ counter: { value: 2 }, counter2: { value: 3 } });

        setTimeout(() => {
          expect(window.location).toHaveProperty(
            'search',
            '?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A2%7D%2C%22counter2%22%3A%7B%22value%22%3A3%7D%7D'
          );
          jest.useRealTimers();
          done();
        });

        jest.runOnlyPendingTimers();
      });

      it('changes made directly to the replaceStateMountPoints and pushStateMountPoints in the store replace the browser location', done => {
        jest.useFakeTimers();

        const oldPush = window.history.pushState;
        const oldReplace = window.history.replaceState;

        const pushState = (window.history.pushState = jest.fn(
          oldPush.bind(window.history)
        ));
        const replaceState = (window.history.replaceState = jest.fn(
          oldReplace.bind(window.history)
        ));

        const store = createRouterEnabledStore({
          pushStateMountPoints: ['counter'],
          replaceStateMountPoints: ['counter2'],
          routerOptions: {
            debounceTime: 1000
          }
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
            expect(pushState.mock.calls.length).toEqual(
              1,
              'it shouldnt increment as the url hasnt changed'
            );
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
            expect(replaceState.mock.calls.length).toEqual(
              1,
              'shouldnt increment due to debounce'
            );
          }
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

      it('changes made directly to the replaceStateMountPoints in the store replace the browser location', done => {
        jest.useFakeTimers();

        const oldPush = window.history.pushState;
        const oldReplace = window.history.replaceState;

        const pushState = (window.history.pushState = jest.fn(
          oldPush.bind(window.history)
        ));
        const replaceState = (window.history.replaceState = jest.fn(
          oldReplace.bind(window.history)
        ));

        const store = createRouterEnabledStore({
          initialState: { counter: { value: 1 } },
          replaceStateMountPoints: ['counter2'],
          routerOptions: {
            debounceTime: 1000
          }
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
          }
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
    });

    describe('Match', () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        history.pushState(
          null,
          null,
          'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2'
        );
      });

      it('renders children if the window.location path matches', () => {
        const store = createRouterEnabledStore();
        unsubscribe = store.subscribe(jest.fn());

        const childComponent = jest.fn(() => null);
        const Component = () => childComponent();

        renderer.create(
          <Container store={store}>
            <Match path="/page1">
              <Component />
            </Match>
          </Container>
        );
        expect(childComponent.mock.calls.length).toEqual(1);
      });

      it('it can accept a function to match the path', () => {
        const children = <span>hi</span>;
        const pathMatch = path => path == 'page1' || path == 'page2';

        expect(
          mount(
            <MatchSimple path={pathMatch} currentPath="page1">
              {children}
            </MatchSimple>
          ).html()
        ).toEqual('<div><span>hi</span></div>');

        expect(
          mount(
            <MatchSimple path={pathMatch} currentPath="page2">
              {children}
            </MatchSimple>
          ).html()
        ).toEqual('<div><span>hi</span></div>');

        expect(
          mount(
            <MatchSimple path={pathMatch} currentPath="page3">
              {children}
            </MatchSimple>
          ).html()
        ).toEqual(null);
      });

      it('does not render children if the window.location path does not match', () => {
        const store = createRouterEnabledStore();
        unsubscribe = store.subscribe(jest.fn());
        const childComponent = jest.fn(() => null);
        const Component = () => childComponent();

        renderer.create(
          <Container store={store}>
            <Match path="/page2">
              <Component />
            </Match>
          </Container>
        );
        expect(childComponent.mock.calls.length).toEqual(0);
      });

      it('renders children when the store updates and the paths match', () => {
        const store = createRouterEnabledStore();
        unsubscribe = store.subscribe(jest.fn());
        const childComponent = jest.fn(() => null);
        const Component = () => childComponent();

        renderer.create(
          <Container store={store}>
            <Match path="/page2">
              <Component />
            </Match>
          </Container>
        );
        expect(childComponent.mock.calls.length).toEqual(0);
        store.navigate('/page2');
        expect(childComponent.mock.calls.length).toEqual(1);
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
          pushStateMountPoints: ['counter']
        });
        unsubscribe = store.subscribe(jest.fn());
        store.navigate('page2');
        expect(window.location.href).toEqual(
          'http://example.com/page2?storeData=%7B%22counter%22%3A%7B%22value%22%3A1%7D%7D'
        );
      });

      it('pushes the path to the browser state if hash is being used', () => {
        window.history.pushState(null, null, 'http://example.com/page1');
        const store = createRouterEnabledStore({
          routerOptions: { useHash: true }
        });
        unsubscribe = store.subscribe(jest.fn());
        store.navigate('page2');
        expect(window.location.href).toEqual('http://example.com/page2');
      });
    });

    describe('Link', () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        history.pushState(
          null,
          null,
          'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2'
        );
      });

      it('updates location and store when clicked on', () => {
        const store = createRouterEnabledStore();
        unsubscribe = store.subscribe(jest.fn());

        const component = mount(
          <Container store={store}>
            <Link href="/page2" />
          </Container>
        );

        expect(window.location.pathname.startsWith('/page1')).toBe(true);
        component.find('a').simulate('click');
        expect(window.location.pathname.startsWith('/page2')).toBe(true);
      });
    });

    describe('debounce', () => {
      beforeEach(jest.useFakeTimers);

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
        'http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2'
      );
    });

    it('pushState should not be called when updating a non sync mountpoint after using browser back', done => {
      const oldPush = window.history.pushState;
      const pushState = (window.history.pushState = jest.fn(
        oldPush.bind(window.history)
      ));

      const store = createRouterEnabledStore({
        initialState: {
          counter: { value: 1 },
          counter2: { value: 1 }
        },
        pushStateMountPoints: ['counter']
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
