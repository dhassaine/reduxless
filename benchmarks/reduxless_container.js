const renderer = require("react-test-renderer");
const React = require("react");
const reduxless = require("../react");
const STATE_SIZE = require("./constants").STATE_SIZE;

const initialState = {};
for (let i = 1; i <= STATE_SIZE; i++) {
  initialState[`mount${i}`] = {
    value1: 1,
    value2: 2
  };
}

const store = reduxless.createStore(initialState);

const setAction1 = (store, value1, value2) =>
  store.set("mount1", {
    value1: value1,
    value2: value2
  });

const selectors = [];
for (let i = 1; i <= STATE_SIZE; i++) {
  selectors.push(store => store.get(`mount${i}`).value1);
}

const childComponent = () => null;
const props = selectors.reduce((result, fn, i) => {
  result[`mount${i}`] = fn;
  return result;
}, {});
const Component = reduxless.mapper(props)(childComponent);
renderer.create(
  React.createElement(
    reduxless.Container,
    { store },
    React.createElement(Component, null, null)
  )
);

exports.containerTest = () => {
  // doesn't re-render
  store.set("newMount", { b: 3 });

  // does re-render
  setAction1(store, 20, 30);
};
