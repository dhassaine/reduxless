/* global describe, it, expect, jest, afterEach */
import React from "react";
import { Container, createStore, enableHistory, Link, Match } from "../main";
import { Match as MatchSimple } from "./Match";
import { debounce } from "./index";
import { navigate } from "./actions";
import renderer from "react-test-renderer";
import { mount } from "enzyme";

const url =
  "http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A1%7D%2C%22counter2%22%3A%7B%22value%22%3A2%7D%7D";

describe("router/index", () => {
  /*
  describe("extractStoreFromLocation", () => {
    it("extracts storeData parameter from query string", () => {
      const query = `?storeData={"prop":2}&foo=bar`;
      expect(extractStoreFromLocation(query)).toEqual({ prop: 2 });
    });

    it("returns an empty object if the no store is found or its baddly formed", () => {
      expect(extractStoreFromLocation("")).toEqual({});
      expect(extractStoreFromLocation(`storeData={"`)).toEqual({});
    });
  });
  */

  describe("enableHistory", () => {
    describe("on initial page load", () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        history.pushState(null, null, url);
      });

      it("syncs storeData from the query parameters to the store", () => {
        const store = createStore();
        unsubscribe = enableHistory(store, ["counter", "counter2"]);

        expect(store.get("counter")).toEqual({ value: 1 });
        expect(store.get("counter2")).toEqual({ value: 2 });
      });
    });

    describe("on history change", () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        history.pushState(null, null, url);
      });

      it("syncs registered storeData from window.location to the store", done => {
        const store = createStore();
        unsubscribe = enableHistory(store, ["counter", "counter2"]);
        const assertions = [
          () => {
            expect(store.get("counter")).toEqual({ value: 1 });
            expect(store.get("counter2")).toEqual({ value: 2 });
          },
          () => {
            expect(store.get("counter")).toEqual({ value: 2 });
            expect(store.get("counter2")).toEqual({ value: 3 });
          }
        ];

        store.subscribe(() => {
          const assert = assertions.pop();

          try {
            assert();
          } catch (error) {
            done(error);
          }

          if (assertions.length === 0) {
            return done();
          }
          history.back();
        });

        history.pushState(
          null,
          null,
          "http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A2%7D%2C%22counter2%22%3A%7B%22value%22%3A3%7D%7D"
        );
        history.pushState(null, null, "/ignored");
        history.back();
      });

      it("changes made directly to the registered sync data in the store automatically update the browser location", done => {
        jest.useFakeTimers();
        const store = createStore();
        enableHistory(store, ["counter", "counter2"], {
          debounceTime: 1000
        });

        expect(store.get("counter")).toEqual({ value: 1 });
        expect(store.get("counter2")).toEqual({ value: 2 });
        store.setAll({ counter: { value: 2 }, counter2: { value: 3 } });

        setTimeout(() => {
          expect(window.location).toHaveProperty(
            "search",
            "?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A2%7D%2C%22counter2%22%3A%7B%22value%22%3A3%7D%7D"
          );
          done();
        });

        jest.runOnlyPendingTimers();
      });

      it("changes made directly to the replaceStateMountPoints and pushStateMountPoints in the store replace the browser location", done => {
        jest.useFakeTimers();

        const oldPush = window.history.pushState;
        const oldReplace = window.history.replaceState;

        const pushState = (window.history.pushState = jest.fn(
          oldPush.bind(window.history)
        ));
        const replaceState = (window.history.replaceState = jest.fn(
          oldReplace.bind(window.history)
        ));

        const store = createStore();
        expect(replaceState.mock.calls.length).toEqual(0);
        unsubscribe = enableHistory(store, ["counter"], ["counter2"], {
          debounceTime: 1000
        });
        expect(replaceState.mock.calls.length).toEqual(1);

        const assertions = [
          () => {
            expect(store.get("counter")).toEqual({ value: 2 });
            expect(store.get("counter2")).toEqual({ value: 2 });
            expect(pushState.mock.calls.length).toEqual(1);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get("counter")).toEqual({ value: 2 });
            expect(store.get("counter2")).toEqual({ value: 3 });
            expect(pushState.mock.calls.length).toEqual(1);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get("counter")).toEqual({ value: 3 });
            expect(store.get("counter2")).toEqual({ value: 3 });
            expect(pushState.mock.calls.length).toEqual(2);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get("counter")).toEqual({ value: 3 });
            expect(store.get("counter2")).toEqual({ value: 4 });
            expect(pushState.mock.calls.length).toEqual(2);
            expect(replaceState.mock.calls.length).toEqual(1);
          }
        ];

        expect(store.get("counter")).toEqual({ value: 1 });
        expect(store.get("counter2")).toEqual({ value: 2 });

        store.subscribe(() => {
          const assert = assertions.shift();
          try {
            assert();
          } catch (error) {
            window.history.pushState = oldPush;
            window.history.replaceState = oldReplace;
            unsubscribe();
            done(error);
          }

          if (assertions.length === 0) {
            setTimeout(() => {
              expect(replaceState.mock.calls.length).toEqual(2);
              window.history.pushState = oldPush;
              window.history.replaceState = oldReplace;
              unsubscribe();
              done();
            }, 2000);
            jest.runOnlyPendingTimers();
          }
        });

        store.set("counter", { value: 2 }); // pushState
        store.set("counter2", { value: 3 }); // replaceState
        store.set("counter", { value: 3 }); // pushState
        store.set("counter2", { value: 4 }); // replaceState
      });

      it("changes made directly to the replaceStateMountPoints in the store replace the browser location", done => {
        jest.useFakeTimers();

        const oldPush = window.history.pushState;
        const oldReplace = window.history.replaceState;

        const pushState = (window.history.pushState = jest.fn(
          oldPush.bind(window.history)
        ));
        const replaceState = (window.history.replaceState = jest.fn(
          oldReplace.bind(window.history)
        ));

        const store = createStore();
        expect(replaceState.mock.calls.length).toEqual(0);
        unsubscribe = enableHistory(store, [], ["counter2"], {
          debounceTime: 1000
        });
        expect(replaceState.mock.calls.length).toEqual(1);

        const assertions = [
          () => {
            expect(store.get("counter")).toEqual({ value: 2 });
            expect(store.get("counter2")).toEqual({ value: 2 });
            expect(pushState.mock.calls.length).toEqual(0);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get("counter")).toEqual({ value: 2 });
            expect(store.get("counter2")).toEqual({ value: 3 });
            expect(pushState.mock.calls.length).toEqual(0);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get("counter")).toEqual({ value: 3 });
            expect(store.get("counter2")).toEqual({ value: 3 });
            expect(pushState.mock.calls.length).toEqual(0);
            expect(replaceState.mock.calls.length).toEqual(1);
          },
          () => {
            expect(store.get("counter")).toEqual({ value: 3 });
            expect(store.get("counter2")).toEqual({ value: 4 });
            expect(pushState.mock.calls.length).toEqual(0);
            expect(replaceState.mock.calls.length).toEqual(1);
          }
        ];

        expect(store.get("counter2")).toEqual({ value: 2 });

        store.subscribe(() => {
          const assert = assertions.shift();

          try {
            assert();
          } catch (error) {
            window.history.pushState = oldPush;
            window.history.replaceState = oldReplace;
            done(error);
          }

          if (assertions.length === 0) {
            jest.runOnlyPendingTimers();
            expect(replaceState.mock.calls.length).toEqual(2);
            window.history.pushState = oldPush;
            window.history.replaceState = oldReplace;
            return done();
          }
        });

        store.set("counter", { value: 2 }); // simple update
        store.set("counter2", { value: 3 }); // replaceState
        store.set("counter", { value: 3 }); // simple update
        store.set("counter2", { value: 4 }); // replaceState
        unsubscribe();
      });
    });

    describe("Match", () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        history.pushState(
          null,
          null,
          "http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2"
        );
      });

      it("only renders children if the window.location path matches", () => {
        const store = createStore();
        unsubscribe = enableHistory(store);
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

      it("it can accept a function to match the path", () => {
        const children = <span>hi</span>;
        const pathMatch = path => path == "page1" || path == "page2";

        expect(
          mount(
            <MatchSimple path={pathMatch} currentPath="page1">
              {children}
            </MatchSimple>
          ).html()
        ).toEqual("<div><span>hi</span></div>");

        expect(
          mount(
            <MatchSimple path={pathMatch} currentPath="page2">
              {children}
            </MatchSimple>
          ).html()
        ).toEqual("<div><span>hi</span></div>");

        expect(
          mount(
            <MatchSimple path={pathMatch} currentPath="page3">
              {children}
            </MatchSimple>
          ).html()
        ).toEqual(null);
      });

      it("does not render children if the window.location path does not match", () => {
        const store = createStore();
        unsubscribe = enableHistory(store);
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

      it("renders children when the store updates and the paths match", () => {
        const store = createStore();
        unsubscribe = enableHistory(store);
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
        navigate(store, "/page2");
        expect(childComponent.mock.calls.length).toEqual(1);
      });
    });

    describe("Link", () => {
      let unsubscribe = null;

      afterEach(() => {
        if (unsubscribe) unsubscribe();
        history.pushState(
          null,
          null,
          "http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2"
        );
      });

      it("updates location and store when clicked on", () => {
        const store = createStore();
        unsubscribe = enableHistory(store);

        const component = mount(
          <Container store={store}>
            <Link href="/page2" />
          </Container>
        );

        expect(window.location.pathname.startsWith("/page1")).toBe(true);
        component.find("a").simulate("click");
        expect(window.location.pathname.startsWith("/page2")).toBe(true);
      });
    });

    describe("debounce", () => {
      it("should fire a function after the debounce time", () => {
        jest.useFakeTimers();
        const callee = jest.fn();
        const timed = debounce(1000, callee);
        timed();
        jest.advanceTimersByTime(500);
        expect(callee.mock.calls.length).toEqual(0);
        jest.advanceTimersByTime(500);
        expect(callee.mock.calls.length).toEqual(1);
        jest.runOnlyPendingTimers();
      });

      it("should not trigger a pending call if interrupted by another", () => {
        jest.useFakeTimers();
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

      it("should forward arguments for debounced function", () => {
        jest.useFakeTimers();
        const callee = jest.fn();
        const timed = debounce(1000, callee);
        timed("dick", "tracy");
        jest.runOnlyPendingTimers();
        expect(callee.mock.calls.length).toEqual(1);
        expect(callee.mock.calls[0]).toEqual(["dick", "tracy"]);
      });
    });
  });
});
