const React = require("react");
const renderer = require("react-test-renderer");
const redux = require("redux");
const reduxReact = require("react-redux");
const STATE_SIZE = require("./constants").STATE_SIZE;

const ActionType1 = "ADD1";

const defaultState = {
  value1: 1,
  value2: 2
};
const reducer1 = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType1:
      return {
        value1: action.value1,
        value2: action.value2
      };

    default:
      return state;
  }
};

const ActionType2 = "ADD2";
const makeReducer2 = () => (state = defaultState, action) => {
  switch (action.type) {
    case ActionType2:
      return {
        value1: action.value1,
        value2: action.value2
      };

    default:
      return state;
  }
};

const dummyReducers = {};
for (let i = 2; i <= STATE_SIZE; i++) {
  dummyReducers[`mount${i}`] = makeReducer2();
}

const nestedReducer = (state = { value: 1 }, action) => {
  switch (action.type) {
    case "NESTED_CHANGE":
      return {
        value: action.value
      };

    default:
      return state;
  }
};

const reducers = { mount1: reducer1, ...dummyReducers, nested: nestedReducer };

const store = redux.createStore(redux.combineReducers(reducers));

const setAction1 = (value1, value2) => ({
  type: ActionType1,
  value1: value1,
  value2: value2
});

const noopAction = () => ({ type: "noop" });

const selectors = [];
for (let i = 1; i <= STATE_SIZE; i++) {
  selectors.push(state => state[`mount${i}`].value1);
}

exports.actionTest = () => store.dispatch(setAction1(2, 3));

exports.actionAndSelectorTest = () => {
  store.dispatch(setAction1(2, 3));
  selectors.forEach(selector => selector(store.getState()));
};

const NestedComponent = () => null;
const MappedNestedComponent = reduxReact.connect(state => ({
  prop: state.nested
}))(NestedComponent);

const Component = () => React.createElement(MappedNestedComponent, null, null);

const mapStateToProps = state =>
  selectors.reduce((result, fn, i) => {
    result[`mount${i}`] = fn(state);
    return result;
  }, {});

const MappedComponent = reduxReact.connect(mapStateToProps)(Component);
renderer.create(
  React.createElement(
    reduxReact.Provider,
    { store },
    React.createElement(MappedComponent, null, null)
  )
);

exports.containerTest = () => {
  // doesn't re-render
  store.dispatch(noopAction());
  // re-renders outer connected component
  store.dispatch(setAction1(20, 30));
  // re-renders nested mapped component
  store.dispatch({ type: "NESTED_CHANGE", value: 4 });
};