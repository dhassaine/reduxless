/* global describe, it, expect */

import { Container } from "./index";

describe("preact/index", () => {
  it("smoke test", () => {
    expect(typeof Container).toBe("function");
  });
});
