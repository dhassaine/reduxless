/* global describe, it, expect */

import { createStore } from "./index";

describe("preact/index", () => {
  it("smoke test", () => {
    expect(createStore).toBeTruthy();
  });
});
