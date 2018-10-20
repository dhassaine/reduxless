/* global describe, it, expect */
import * as api from ".";
import Wrapper from "../index";

class Component {}

describe("preact/index", () => {
  it("smoke test", () => {
    Object.keys(Wrapper({ Component })).forEach(fn =>
      expect(typeof api[fn]).toBe("function")
    );
  });
});
