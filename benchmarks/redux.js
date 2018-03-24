const redux = require("redux");
const STATE_SIZE = 1000;

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

const reducers = { mount1: reducer1, ...dummyReducers };

const store = redux.createStore(redux.combineReducers(reducers));

const setAction1 = (value1, value2) => ({
  type: ActionType1,
  value1: value1,
  value2: value2
});

const selectors = [];
for (let i = 1; i <= STATE_SIZE; i++) {
  selectors.push(state => state[`mount${i}`].value1);
}

exports.actionTest = () => store.dispatch(setAction1(2, 3));

exports.actionAndSelectorTest = () => {
  store.dispatch(setAction1(2, 3));
  selectors.forEach(selector => selector(store.getState()));
};
