import Ajv from "ajv";
const ajv = new Ajv();

export const mountPoint = "counter";

const schema = {
  type: "object",
  properties: {
    value: {
      type: "integer"
    }
  }
};

export const validator = data => {
  const validated = ajv.validate(schema, data);
  return { valid: validated, errors: ajv.errors };
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
