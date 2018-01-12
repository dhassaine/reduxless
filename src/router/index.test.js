/* global describe, it, expect, jest, afterEach */
import React from "react";
import { Container, createStore, enableHistory, Link, Match } from "../main";
import { updateHistory } from "./index";
import renderer from "react-test-renderer";
import { mount } from "enzyme";

const url =
  "http://example.com/page1?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A1%7D%2C%22counter2%22%3A%7B%22value%22%3A2%7D%7D";

describe("enableHistory", () => {
  describe("on initial page load", () => {
    let unsubscribe = null;

    afterEach(() => {
      if (unsubscribe) unsubscribe();
      history.pushState(null, null, url);
    });

    it("syncs the url to the store", () => {
      const store = createStore();
      unsubscribe = enableHistory(store);
      expect(store.get("location")).toHaveProperty("href", url);
    });

    it("syncs the pathname to the store", () => {
      const store = createStore();
      unsubscribe = enableHistory(store);

      expect(store.get("location")).toHaveProperty("pathname", "/page1");
    });

    it("syncs the query string to the store", () => {
      const store = createStore();
      unsubscribe = enableHistory(store);

      expect(store.get("location")).toHaveProperty(
        "queryString",
        "?queryParam=queryValue&a[]=1&a[]=2&storeData=%7B%22counter%22%3A%7B%22value%22%3A1%7D%2C%22counter2%22%3A%7B%22value%22%3A2%7D%7D"
      );
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

    it("syncs browser location changes to the store", done => {
      const store = createStore();
      unsubscribe = enableHistory(store);
      const assertions = [
        () => {
          expect(store.get("location")).toHaveProperty("href", url);
          expect(store.get("location")).toHaveProperty("pathname", "/page1");
        },

        () => {
          expect(store.get("location")).toHaveProperty(
            "href",
            "http://example.com/page2"
          );
          expect(store.get("location")).toHaveProperty("pathname", "/page2");
          expect(store.get("location")).toHaveProperty("queryString", "");
        },

        () => {
          expect(store.get("location")).toHaveProperty(
            "href",
            "http://example.com/page3?queryParam=queryValue&a[]=1&a[]=2"
          );
          expect(store.get("location")).toHaveProperty("pathname", "/page3");
          expect(store.get("location")).toHaveProperty(
            "queryString",
            "?queryParam=queryValue&a[]=1&a[]=2"
          );
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

      history.pushState(null, null, "/page2");
      history.pushState(null, null, "/page3?queryParam=queryValue&a[]=1&a[]=2");
      history.pushState(null, null, "/page4");
      history.back();
    });

    it("syncs registered storeData from location to the store", done => {
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

    it("does not renders children if the window.location path does not match", () => {
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
      updateHistory(store, "/page2");
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

      expect(store.get("location")).toHaveProperty("pathname", "/page1");
      component.simulate("click");
      expect(store.get("location")).toHaveProperty("pathname", "/page2");
    });
  });
});
