const renderer = require("react-test-renderer");
const React = require("react");
const reduxless = require("../dist");
const STATE_SIZE = require("./constants").STATE_SIZE;

const { createStore } = reduxless;
const { mapper, Container } = reduxless.makeComponents(React);

const initialState = { nested: { value: 1 } };
for (let i = 1; i <= STATE_SIZE; i++) {
  initialState[`mount${i}`] = {
    value1: 1,
    value2: 2
  };
}

const store = createStore(initialState);

const setAction1 = (store, value1, value2) =>
  store.set("mount1", {
    value1: value1,
    value2: value2
  });

const selectors = [];
for (let i = 1; i <= STATE_SIZE; i++) {
  selectors.push(store => store.get(`mount${i}`).value1);
}

const props = selectors.reduce((result, fn, i) => {
  result[`mount${i}`] = fn;
  return result;
}, {});

const NestedComponent = () => null;
const MappedNestedComponent = mapper({
  prop: store => store.get("nested")
})(NestedComponent);

const Component = () => React.createElement(MappedNestedComponent, null, null);
const MappedComponent = mapper(props)(Component);
renderer.create(
  React.createElement(
    Container,
    { store },
    React.createElement(MappedComponent, null, null)
  )
);

exports.containerTest = () => {
  // doesn't re-render
  store.set("newMount", { b: 3 });

  // re-renders outer mapped component
  setAction1(store, 20, 30);

  // re-renders nested mapped component
  store.set("nested", { value: 2 });
};
