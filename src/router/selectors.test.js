/* global describe, it, expect */
import { extractPartsFromPath } from "./selectors";

describe("router/selectors", () => {
  describe("extractPartsFromPath", () => {
    it("return pathName, query and parse store data from window.location", () => {
      const store = { useHash: false };
      const results = extractPartsFromPath(store);
      expect(results).toEqual({
        pathName: "/page1",
        query: "queryParam=queryValue&a[]=1&a[]=2",
        storeData: {
          counter: { value: 1 },
          counter2: { value: 2 }
        }
      });
    });

    it("parses window.hash if store.useHash is true", () => {
      const store = { useHash: true };
      window.location.hash = "#page1";
      const results = extractPartsFromPath(store);
      expect(results).toEqual({
        pathName: "/page1",
        query: "",
        storeData: {}
      });
    });

    it("returns an empty object if the no store is badly formed", () => {
      const store = { useHash: true };
      window.location.hash = "#?storeData={";
      expect(extractPartsFromPath(store)).toEqual({
        pathName: "/",
        query: "",
        storeData: {}
      });
    });

    it("returns an empty object if the no store is found", () => {
      const store = { useHash: true };
      window.location.hash = "#?a=1";
      expect(extractPartsFromPath(store)).toEqual({
        pathName: "/",
        query: "a=1",
        storeData: {}
      });
    });
  });
});
