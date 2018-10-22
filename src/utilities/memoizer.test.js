/* global describe, it, jest */
import { expect } from "chai";
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
    expect(memoisedA(fakeStore)).to.equal(1);
    expect(fn.mock.calls.length).to.equal(1);
    expect(memoisedA(fakeStore)).to.equal(1);
    expect(fn.mock.calls.length).to.equal(1);
    fakeStore.set("a", 2);
    expect(memoisedA(fakeStore)).to.equal(2);
    expect(fn.mock.calls.length).to.equal(2);
    fakeStore.set("b", 2);
    expect(memoisedA(fakeStore)).to.equal(2);
    expect(fn.mock.calls.length).to.equal(2);
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
    expect(memoisedA(fakeStore)).to.equal(3);
    expect(fn.mock.calls.length).to.equal(1);
    expect(memoisedA(fakeStore)).to.equal(3);
    expect(fn.mock.calls.length).to.equal(1);
    fakeStore.set("a", 2);
    expect(memoisedA(fakeStore)).to.equal(4);
    expect(fn.mock.calls.length).to.equal(2);
    fakeStore.set("c", 2);
    expect(memoisedA(fakeStore)).to.equal(4);
    expect(fn.mock.calls.length).to.equal(2);
  });
});
