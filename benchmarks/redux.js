const redux = require("redux");

const ActionType1 = "ADD1";
const reducer1 = (state = {}, action) => {
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
const makeReducer2 = () => (state = {}, action) => {
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
for (let i = 2; i <= 100; i++) {
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
for (let i = 1; i <= 100; i++) {
  selectors.push(
    state => state[`mount${i}`].value1 * state[`mount${i}`].value2
  );
}

module.exports = () => {
  store.dispatch(setAction1(2, 3));
  //selectors.forEach(selector => selector(store.getState()));
};
