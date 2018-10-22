/* global describe, it, jest, expect */
import createStore from "../state/store";
import selectorMemoizer from "./memoizer";

describe("selectorMemoizer", () => {
  it("creates a memoised selector", () => {
    const fn = jest.fn(a => a);
    const data = {
      a: 1
    };
    const fakeStore = createStore(data);
    const memoisedA = selectorMemoizer(fn, store => store.get("a"));
    expect(memoisedA(fakeStore)).toBe(1);
    expect(fn.mock.calls.length).toBe(1);
    expect(memoisedA(fakeStore)).toBe(1);
    expect(fn.mock.calls.length).toBe(1);
    fakeStore.set("a", 2);
    expect(memoisedA(fakeStore)).toBe(2);
    expect(fn.mock.calls.length).toBe(2);
    fakeStore.set("b", 2);
    expect(memoisedA(fakeStore)).toBe(2);
    expect(fn.mock.calls.length).toBe(2);
  });

  it("can take multiple properties", () => {
    const fn = jest.fn((a, b) => a + b);
    const data = {
      a: 1,
      b: 2
    };
    const fakeStore = createStore(data);
    const memoisedA = selectorMemoizer(
      fn,
      store => store.get("a"),
      store => store.get("b")
    );
    expect(memoisedA(fakeStore)).toBe(3);
    expect(fn.mock.calls.length).toBe(1);
    expect(memoisedA(fakeStore)).toBe(3);
    expect(fn.mock.calls.length).toBe(1);
    fakeStore.set("a", 2);
    expect(memoisedA(fakeStore)).toBe(4);
    expect(fn.mock.calls.length).toBe(2);
    fakeStore.set("c", 2);
    expect(memoisedA(fakeStore)).toBe(4);
    expect(fn.mock.calls.length).toBe(2);
  });
});
