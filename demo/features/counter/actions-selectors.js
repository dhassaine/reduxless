export const mountPoint = "counter";

export const schema = {
  type: "object",
  properties: {
    value: {
      type: "number"
    }
  }
};

export const initialState = {
  [mountPoint]: {
    value: 0
  }
};

export const selectCounter = store => {
  const counter = store.get(mountPoint);
  if (counter) {
    return counter.value;
  } else {
    return 0;
  }
};

export const setCounter = (store, value) => store.set(mountPoint, { value });

export const incrementCounter = store =>
  setCounter(store, selectCounter(store) + 1);

export const decrementCounter = store =>
  setCounter(store, selectCounter(store) - 1);

export const incrementAsync = store =>
  Promise.resolve().then(() => setCounter(store, selectCounter(store) + 1));
